import base64
import numpy as np
import redis
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
from persiantools.jdatetime import JalaliDateTime
import json
import os
import logging
import boto3
from botocore.exceptions import NoCredentialsError
import ssl

# ایجاد پوشه trainer جهت ذخیره مدل در صورت عدم وجود
os.makedirs("trainer", exist_ok=True)

# --------------------- تنظیمات لاگ ---------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --------------------- تنظیمات اتصال ---------------------
# تنظیمات Redis
redis_client = redis.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)

# --------------------- تنظیمات Flask و CORS ---------------------
app = Flask(__name__)
CORS(app)

# --------------------- تنظیمات Haar Cascade ---------------------
HAAR_CASCADE_PATHS = {
    "face": "assets/face_detection/haarcascade_frontalface_default.xml",
    "eye": "assets/face_detection/haarcascade_eye.xml"
}

if not all(os.path.exists(path) for path in HAAR_CASCADE_PATHS.values()):
    raise FileNotFoundError("یکی از فایل‌های Haar Cascade موجود نیست.")

face_cascade = cv2.CascadeClassifier(HAAR_CASCADE_PATHS["face"])
eye_cascade = cv2.CascadeClassifier(HAAR_CASCADE_PATHS["eye"])

# --------------------- تنظیمات فضای ابری لیارا ---------------------
LIARA_ACCESS_KEY = 'u2cgc3ev1i29tmeg'
LIARA_SECRET_KEY = '46c86213-2684-4421-9c1d-7d96cb22ac14'
LIARA_BUCKET_NAME = 'photo-attendance-system'
LIARA_ENDPOINT_URL = 'https://storage.c2.liara.space'

s3_client = boto3.client('s3',
                         aws_access_key_id=LIARA_ACCESS_KEY,
                         aws_secret_access_key=LIARA_SECRET_KEY,
                         endpoint_url=LIARA_ENDPOINT_URL)

# --------------------- توابع کمکی ---------------------
def base64_to_cv2_image(base64_str):
    """تبدیل رشته Base64 به تصویر OpenCV"""
    try:
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        img_data = base64.b64decode(base64_str)
        np_arr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        logging.error(f"خطا در تبدیل تصویر Base64: {e}")
        raise ValueError("تصویر معتبر نیست.")

def detect_and_validate_face(image):
    """تشخیص چهره و اعتبارسنجی آن (وجود حداقل ۲ چشم)"""
    try:
        gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_img, scaleFactor=1.3, minNeighbors=5)

        if len(faces) == 0:
            return None, None, None

        for (x, y, w, h) in faces:
            face_gray = gray_img[y:y + h, x:x + w]
            face_gray = cv2.resize(face_gray, (200, 200))

            face_color = image[y:y + h, x:x + w]
            face_color_resized = cv2.resize(face_color, (200, 200))

            eyes_detected = eye_cascade.detectMultiScale(face_gray)
            if len(eyes_detected) < 2:
                logging.warning("چهره ناقص است: چشم‌ها شناسایی نشدند.")
                return None, None, None

            return face_gray, face_color_resized, (x, y, w, h)

        return None, None, None
    except Exception as e:
        logging.error(f"خطا در پردازش تصویر: {e}")
        raise

def upload_to_liara(national_code, color_image_data):
    """آپلود تصویر رنگی به فضای ابری لیارا"""
    try:
        folder_name = "user_register"
        file_name = f"{folder_name}/{national_code}.jpg"
        s3_client.put_object(Bucket=LIARA_BUCKET_NAME, Key=file_name, Body=color_image_data, ContentType='image/jpeg')
        logging.info(f"تصویر رنگی برای کد ملی {national_code} در پوشه {folder_name} در فضای ابری لیارا با موفقیت ذخیره شد.")
    except NoCredentialsError:
        logging.error("مشکل در احراز هویت با لیارا.")
        raise ValueError("احراز هویت با فضای ابری لیارا انجام نشد.")
    except Exception as e:
        logging.error(f"خطا در آپلود به لیارا: {e}")
        raise ValueError("آپلود به فضای ابری لیارا با خطا مواجه شد.")

def train_model():
    """
    آموزش مدل با داده‌های موجود در Redis و ذخیره لیبل‌ها در فایل JSON
    """
    faces = []
    labels = []

    for key in redis_client.scan_iter():
        try:
            data = json.loads(redis_client.get(key))
            face_base64 = data.get("faceImage")
            if not face_base64:
                continue

            np_arr = np.frombuffer(base64.b64decode(face_base64), np.uint8)
            face_image = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

            if face_image is not None:
                resized_face = cv2.resize(face_image, (100, 100))
                faces.append(resized_face)

                try:
                    label = int(key)
                except ValueError:
                    logging.warning(f"کلید {key} به عنوان لیبل معتبر نیست.")
                    continue
                labels.append(label)
        except Exception as ex:
            logging.error(f"خطا در خواندن داده از Redis برای کلید {key}: {ex}")

    if faces and labels:
        try:
            model = cv2.face.LBPHFaceRecognizer_create()
            model.train(np.array(faces), np.array(labels))
            model_path = os.path.join("trainer", "model.xml")
            model.write(model_path)
            logging.info("مدل با موفقیت آموزش داده شد.")
        except Exception as e:
            logging.error(f"خطا در آموزش مدل: {e}")
    else:
        logging.warning("هیچ داده‌ای برای آموزش یافت نشد.")

def save_to_redis(national_code, face_image_gray, face_image_color):
    """ذخیره تصویر سیاه و سفید در Redis و آپلود تصویر رنگی به فضای ابری لیارا"""
    try:
        # ذخیره تصویر سیاه و سفید در Redis
        _, buffer_gray = cv2.imencode('.jpg', face_image_gray)
        base64_face_gray = base64.b64encode(buffer_gray).decode('utf-8')

        face_data = {
            "faceImage": base64_face_gray
        }
        redis_client.set(national_code, json.dumps(face_data))
        logging.info(f"تصویر سیاه و سفید برای کد ملی {national_code} در Redis با موفقیت ذخیره شد.")

        # آپلود تصویر رنگی به فضای ابری لیارا
        _, buffer_color = cv2.imencode('.jpg', face_image_color)
        upload_to_liara(national_code, buffer_color.tobytes())
    except Exception as e:
        logging.error(f"خطا در ذخیره اطلاعات در Redis یا لیارا: {e}")
        raise ValueError("ذخیره‌سازی در Redis یا فضای ابری لیارا با خطا مواجه شد.")

def validate_inputs(data):
    """اعتبارسنجی ورودی‌های دریافتی از کلاینت"""
    required_fields = ["image", "nationalCode"]
    for field in required_fields:
        if not data.get(field):
            raise ValueError(f"فیلد {field} الزامی است.")
    return True

# --------------------- روت آپلود تصویر ---------------------
@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        data = request.json

        validate_inputs(data)
        image = base64_to_cv2_image(data["image"])
        face_gray, face_color, _ = detect_and_validate_face(image)

        if face_gray is None or face_color is None:
            return jsonify({"status": "error", "message": "چهره شناسایی نشد یا چهره ناقص است"}), 400

        save_to_redis(data["nationalCode"], face_gray, face_color)
        train_model()

        return jsonify({"status": "success", "message": "تصویر با موفقیت ذخیره شد و مدل به‌روزرسانی گردید."})

    except ValueError as ve:
        logging.error(f"خطای ورودی: {ve}")
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        logging.error(f"خطا در آپلود تصویر: {e}")
        return jsonify({"status": "error", "message": "خطا در پردازش تصویر"}), 500

ssl_context = ('/path/to/cert.pem', '/path/to/key.pem')  # مسیر گواهی و کلید SSL

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=ssl_context)
