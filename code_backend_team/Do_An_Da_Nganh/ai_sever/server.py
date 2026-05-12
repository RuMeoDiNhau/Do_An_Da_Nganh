import os
import sys

# Chặn hoàn toàn các luồng log của C++ và TensorFlow từ hệ điều hành
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['GLOG_minloglevel'] = '2'
os.environ['GRPC_VERBOSITY'] = 'NONE' # Bịt miệng thằng GRPC (Clearcut dùng cái này)

# Ép hệ thống chuyển hướng mọi lỗi C++ rác vào "hố đen"
if sys.platform == "win32":
    os.environ['OPENCV_VIDEOIO_PRIORITY_MSMF'] = '0'

import cv2
import numpy as np
import mediapipe as mp
from keras_facenet import FaceNet
import joblib
import time
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager

# Khởi tạo AI models
embedder = FaceNet()
ml_models = {"svm": None}

@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_models["svm"] = joblib.load("svm_model_full.pkl")
    yield
    ml_models.clear()

app = FastAPI(lifespan=lifespan)

# Cấu hình MediaPipe
BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path='blaze_face_short_range.tflite'),
    running_mode=VisionRunningMode.IMAGE
)

def gen_frames():
    detector = FaceDetector.create_from_options(options)
    cap = cv2.VideoCapture(1) # 2 là Cam điện thoại 1 là cam lap top 0 là cam phần mềm irinium webcam
    
    debounce_start_time = None
    REQUIRED_TIME = 1
    
    # 1. THÊM BIẾN QUẢN LÝ THỜI GIAN CHỜ (COOLDOWN)
    last_unlock_time = 0  
    COOLDOWN_TIME = 30.0 # 30 giây
    
    # 2. KHAI BÁO DANH SÁCH NGƯỜI NHÀ ĐƯỢC PHÉP VÀO
    ALLOWED_USERS = ["nguyen","bao","huygia","thien","khang"] # Thay bằng các class (tên) bạn đã train
    try:
        while True:
            success, frame = cap.read()
            if not success: break
            frame = cv2.flip(frame, 1)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            detection_result = detector.detect(mp_image)
            
            face_detected_this_frame = False
            if detection_result.detections:
                for detection in detection_result.detections:
                    face_detected_this_frame = True
                    bbox = detection.bounding_box
                    x, y, w, h = bbox.origin_x, bbox.origin_y, bbox.width, bbox.height
                    
                    face_img = frame[max(0, y):y+h, max(0, x):x+w]
                    if face_img.size > 0:
                        face_img_resized = cv2.resize(face_img, (160, 160))
                        embedding = embedder.embeddings([face_img_resized])[0]
                        
                        prob = ml_models["svm"].predict_proba(embedding.reshape(1, -1))[0]
                        max_idx = np.argmax(prob)
                        name = ml_models["svm"].classes_[max_idx]
                        confidence = prob[max_idx]
                        
                        box_color = (0, 0, 255)
                        text = f"DENIED: {name.upper()} ({confidence:.2f})"
                        
                        # 3. NÂNG NGƯỠNG CONFIDENCE > 0.75 VÀ KIỂM TRA ĐÚNG NGƯỜI NHÀ KHÔNG
                        if confidence > 0.75 and name.lower() in ALLOWED_USERS:
                            if debounce_start_time is None: 
                                debounce_start_time = time.time()
                            elapsed = time.time() - debounce_start_time
                            
                            if elapsed >= REQUIRED_TIME:
                                # 4. KIỂM TRA XEM ĐÃ QUA 30 GIÂY KỂ TỪ LẦN MỞ CỬA TRƯỚC CHƯA
                                time_since_last_unlock = time.time() - last_unlock_time
                                
                                if time_since_last_unlock >= COOLDOWN_TIME:
                                    box_color = (0, 255, 0)
                                    text = f"HELLO {name.upper()}!"
                                    
                                    # GHI NHẬN LẠI MỐC THỜI GIAN VỪA MỞ CỬA LÚC NÀY
                                    last_unlock_time = time.time()
                                    
                                    # Gửi API MỘT LẦN DUY NHẤT
                                    try:
                                        requests.post("http://localhost:3001/api/devices/face-access", 
                                                    json={"action": "unlock", "user_class": name}, timeout=0.5)
                                    except: pass
                                else:
                                    # NẾU CHƯA ĐỦ 30S, KHÔNG MỞ NỮA MÀ ĐẾM NGƯỢC THỜI GIAN CHỜ
                                    box_color = (255, 255, 0) # Khung màu vàng/cyan
                                    wait_left = COOLDOWN_TIME - time_since_last_unlock
                                    text = f"OPENED. PLS WAIT {wait_left:.0f}s"
                            else:
                                # Đang đứng đếm đủ 1.5s
                                box_color = (0, 255, 255)
                                text = f"HOLD STILL... {REQUIRED_TIME - elapsed:.1f}s"
                        else:
                            # Người lạ hoặc niềm tin quá thấp
                            debounce_start_time = None

                        cv2.rectangle(frame, (x, y), (x+w, y+h), box_color, 2)
                        cv2.putText(frame, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)

            if not face_detected_this_frame: 
                debounce_start_time = None

            ret, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    finally: 

        cap.release()
        
@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(gen_frames(), media_type="multipart/x-mixed-replace; boundary=frame")