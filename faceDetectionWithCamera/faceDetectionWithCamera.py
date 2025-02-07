import cv2
import numpy as np
import mysql.connector
import redis
from datetime import datetime
from persiantools.jdatetime import JalaliDateTime
import schedule
import time

# --------------------- کلاس مدیریت دوربین‌ها ---------------------
class CameraManager:
    def __init__(self):
        self.cameras = []
        self.grid_size = (2, 2)  # (ردیف, ستون)
        self.active_cam = -1  # حالت تمام صفحه
        self.window_name = "Face Recognition System"
        self.last_click = 0
        self.click_delay = 500  # میلی‌ثانیه

        # مدل تشخیص چهره
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.face_recognizer = cv2.face.LBPHFaceRecognizer_create()
        self.face_recognizer.read('trainer/model.xml')

        # تنظیمات دیتابیس
        self.db = mysql.connector.connect(
            host='localhost',
            database='test',
            user='root',
            password=''
        )

        # اتصال به Redis
        self.redis_db = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
        
        self.last_checkin = {}

    def add_camera(self, name, source, location):
        cap = cv2.VideoCapture(source)
        if cap.isOpened():
            self.cameras.append({
                'cap': cap,
                'name': name,
                'location': location,
                'frame': None
            })
            print(f"✅ دوربین {name} فعال شد!")
        else:
            print(f"❌ خطا در اتصال به دوربین {name}")

    def process_faces(self, frame, location):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            face_roi = gray[y:y + h, x:x + w]

            label, confidence = self.face_recognizer.predict(face_roi)
            if confidence < 100:
                national_code = str(label)
                self.log_attendance(national_code, location)
                self.check_face_in_redis(national_code, frame)

        return cv2.resize(frame, (640, 480))

    def check_face_in_redis(self, national_code, frame):
        # جستجو در Redis برای تصویر
        image_key = f"face:{national_code}"
        if self.redis_db.exists(image_key):
            stored_image = self.redis_db.get(image_key)
            stored_image = np.frombuffer(stored_image, dtype=np.uint8)
            stored_image = cv2.imdecode(stored_image, cv2.IMREAD_COLOR)
            
            # مقایسه تصویر از Redis و تصویر تشخیص داده‌شده
            result = self.compare_faces(stored_image, frame)
            if result:
                print(f"✅ تصویر {national_code} در Redis مطابقت دارد")
                self.log_attendance(national_code, "از Redis پیدا شد")

    def compare_faces(self, stored_image, current_image):
        # اینجا می‌توانید روش مقایسه تصویر را اضافه کنید
        # به عنوان مثال، استفاده از تشخیص ویژگی‌ها یا مقایسه ساده پیکسل‌ها
        stored_gray = cv2.cvtColor(stored_image, cv2.COLOR_BGR2GRAY)
        current_gray = cv2.cvtColor(current_image, cv2.COLOR_BGR2GRAY)
        difference = cv2.absdiff(stored_gray, current_gray)
        if np.sum(difference) < 500000:  # یک آستانه دلخواه برای تفاوت‌ها
            return True
        return False

    def log_attendance(self, national_code, location):
        now = datetime.now()

        if national_code in self.last_checkin:
            if (now - self.last_checkin[national_code]).total_seconds() < 7200:
                return

        try:
            cursor = self.db.cursor()
            jalali_time = JalaliDateTime.now().strftime('%Y-%m-%d %H:%M:%S')

            cursor.execute("""
                INSERT INTO attendance 
                (national_code, checkin_time, location)
                VALUES (%s, %s, %s)
            """, (national_code, jalali_time, location))

            self.db.commit()
            self.last_checkin[national_code] = now
            print(f"✅ حضور {national_code} در {location} ثبت شد")

        except Exception as e:
            print(f"❌ خطای دیتابیس: {e}")

    def update_frames(self):
        for cam in self.cameras:
            ret, frame = cam['cap'].read()
            if ret:
                cam['frame'] = self.process_faces(frame, cam['location'])

    def toggle_fullscreen(self, x, y):
        current_time = cv2.getTickCount()
        if (current_time - self.last_click) * 1000 / cv2.getTickFrequency() < self.click_delay:
            return

        if self.active_cam == -1:
            col = x // (640 + 10)
            row = y // (480 + 10)
            idx = row * self.grid_size[1] + col
            if idx < len(self.cameras):
                self.active_cam = idx
        else:
            self.active_cam = -1

        self.last_click = current_time

    def show_interface(self):
        if self.active_cam != -1:
            frame = self.cameras[self.active_cam]['frame']
            cv2.imshow(self.window_name, frame)
        else:
            grid = []
            for i in range(0, len(self.cameras), self.grid_size[1]):
                row = np.hstack([cam['frame'] for cam in self.cameras[i:i + self.grid_size[1]]])
                grid.append(row)
            final_grid = np.vstack(grid[:self.grid_size[0]])
            cv2.imshow(self.window_name, final_grid)


# --------------------- تنظیمات سیستم ---------------------
manager = CameraManager()
 
manager.add_camera("دوربین لپتاپ", 0, "دوربین لپتاپ")


# --------------------- زمان‌بندی بازنشانی ---------------------
schedule.every(2).hours.do(manager.last_checkin.clear)

# --------------------- مدیریت رویدادهای ماوس ---------------------
def mouse_handler(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDBLCLK:
        manager.toggle_fullscreen(x, y)

cv2.namedWindow(manager.window_name)
cv2.setMouseCallback(manager.window_name, mouse_handler)

# --------------------- اجرای اصلی ---------------------
try:
    while True:
        manager.update_frames()
        manager.show_interface()
        schedule.run_pending()

        if cv2.waitKey(1) == 27:  # خروج با کلید ESC
            break

finally:
    for cam in manager.cameras:
        cam['cap'].release()
    cv2.destroyAllWindows()
    manager.db.close()
