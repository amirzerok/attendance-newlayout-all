import cv2
from flask import Flask, Response, jsonify

# آدرس RTSP دوربین
RTSP_URL = "rtsp://admin:shn123456789@192.168.1.101:554/cam/realmonitor?channel=1"

app = Flask(__name__)

def generate_frames():
    """
    تابعی برای دریافت فریم‌ها از دوربین و ارسال آنها به صورت MJPEG.
    در اینجا ابتدا رنگ‌ها به صورت صحیح RGB پردازش می‌شوند.
    """
    cap = cv2.VideoCapture(RTSP_URL)
    if not cap.isOpened():
        print("Cannot connect to the camera")
        return  # در صورت عدم اتصال به دوربین

    while True:
        success, frame = cap.read()
        if not success:
            break

        # تبدیل فریم از BGR به RGB برای حفظ رنگ‌های اصلی
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # تبدیل فریم به فرمت JPEG
        ret, buffer = cv2.imencode('.jpg', frame_rgb)
        frame_bytes = buffer.tobytes()

        # ارسال فریم به صورت MJPEG
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    """مسیر HTTP برای ارائه جریان ویدئو از دوربین."""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/status')
def status():
    """
    بررسی وضعیت اتصال به دوربین؛ اگر بتواند به دوربین وصل شود online = True
    """
    cap = cv2.VideoCapture(RTSP_URL)
    if cap.isOpened():
        cap.release()
        return jsonify({"online": True})
    else:
        return jsonify({"online": False})

if __name__ == "__main__":
    # اجرای سرور روی آدرس 0.0.0.0 و پورت 5000
    app.run(host="0.0.0.0", port=5000, debug=True)
