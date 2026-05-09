# Báo Cáo Cập Nhật: Tích Hợp AI Face Recognition (Edge Computing)

## 1. Mục Tiêu Cập Nhật
Tích hợp thành công mô hình nhận diện khuôn mặt (FaceNet + SVM) vào hệ thống Smart Home. Hệ thống hiện tại có khả năng quét mặt theo thời gian thực (Real-time), tự động mở cửa (Smart Lock) và cập nhật giao diện (React UI) ngay lập tức thông qua WebSocket mà không cần reload trang.

## 2. Kiến Trúc Hệ Thống (Microservices)
Hệ thống AI được thiết kế chạy song song nhưng độc lập với Node.js Backend để không làm nghẽn luồng xử lý IoT:
- **AI Server (FastAPI - Python):** Chạy ở port `8000`. Phụ trách lấy luồng Video, cắt mặt (MediaPipe), trích xuất đặc trưng (FaceNet), phân loại (SVM) và stream ảnh MJPEG lên UI.
- **Backend (Node.js):** Chạy ở port `3001`. Đóng vai trò là Message Broker (nhận tín hiệu từ AI -> Bắn lệnh MQTT mở cửa -> Bắn WebSocket lên Web).
- **Frontend (React):** Hiển thị luồng Video trực tiếp từ AI Server và cập nhật lịch sử truy cập realtime.

## 3. Các File Đã Thay Đổi / Thêm Mới
### A. Thư mục mới `ai_sever/`
- `server.py`: Chứa toàn bộ logic FastAPI, Load Model, và OpenCV Video Capture.
- `svm_model_*.pkl` & `blaze_face_*.tflite`: Các file trọng số của mô hình AI.

### B. Backend Node.js
- **`server.js`:** Thêm logic `child_process.spawn` để Node.js tự động khởi động AI Server (Python) khi chạy `npm run dev`. Thêm cơ chế chém tiến trình (`taskkill`) chống treo máy khi bấm `Ctrl+C`.
- **`src/app.js`:** Fix lỗi BigInt Serialization để Frontend không bị sập khi đọc dữ liệu có chứa BigInt từ DB PostgreSQL.
- **`src/routes/device.routes.js` & `device.controller.js`:** Thêm API Webhook `POST /api/devices/face-access` để Python gọi sang khi nhận diện đúng người nhà.
- **`src/iot/wsHandler.js`:** Xuất khẩu hàm `globalBroadcast` để các controller có thể chủ động đẩy data lên Web (Realtime).

### C. Frontend React (UI)
- **`AccessSecurity.tsx`:** - Gỡ bỏ luồng lấy Webcam phức tạp (tránh xung đột phần cứng).
  - Sử dụng thẻ `<img>` trỏ trực tiếp đến `http://localhost:8000/video_feed` để stream ảnh từ Python với độ trễ cực thấp.
  - Lắng nghe WebSocket sự kiện `FACE_DETECTED` để tự động đổi màu ổ khoá (Mở cửa) và ghi tên người vào lịch sử truy cập (Log).

## 4. Cải Tiến Logic AI
- **Cơ chế Cooldown (Chống Spam):** Khi mở cửa thành công, AI tự động vào trạng thái nghỉ (Sleep) 30 giây, không gửi thêm request thừa xuống server tránh nghẽn MQTT.
- **Ngưỡng an toàn (Confidence Threshold):** SVM chỉ chấp nhận mở cửa khi độ tin cậy `> 0.85` và tên thuộc danh sách `ALLOWED_USERS`, chặn đứng việc nhận nhầm người lạ. (đang nghiên cứu chắc là để thấp hơn)
- **UI/UX trên Camera:** Lật luồng ảnh như soi gương để người dùng dễ quan sát. Gắn thông báo thời gian đếm ngược trực tiếp lên khung hình (`Unlocking in 1.5s...`).


hiện tại mới chỉ là mở cửa, đang nghiên cứu gửi thêm các preferences mới
HƯỚNG DẪN SETUP HỆ THỐNG YOLO HOME (VERSION AI UPDATE)
Để chạy được tính năng nhận diện khuôn mặt mới, các thành viên cần thực hiện đúng các bước sau:

Cấu hình môi trường Python (AI Server)
Truy cập vào thư mục AI: cd code_backend_team/Do_An_Da_Nganh/ai_sever

Tạo môi trường ảo: python -m venv venv

Kích hoạt môi trường:

Windows: venv\Scripts\activate

M
ac/Linux: source venv/bin/activate
Cài đặt thư viện:
Bash
pip install fastapi uvicorn opencv-python numpy mediapipe keras-facenet tensorflow requests joblib scikit-learn

Lưu ý: Đảm bảo file svm_model.pkl (hiện tại chỉ có tui còn svm_model_+huy+khang.pkl thì có thêm huy với khang nma tui chưa test thử hoạt động ngon không) và blaze_face_short_range.tflite đã có mặt trong thư mục này.

sau đó chạy như bình thường mở 2 terminal 1 be 1 fe là được vì tui đã cấu hình chạy fast api vào cái server.js r
