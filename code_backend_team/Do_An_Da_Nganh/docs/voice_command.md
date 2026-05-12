# Báo cáo Cập nhật: Tính năng Điều khiển bằng Giọng nói (Voice Control)

## 1. Công nghệ sử dụng
- **Web Speech API**: Xử lý Speech-to-Text trực tiếp trên trình duyệt (khuyến nghị dùng Google Chrome để nhận diện tiếng Việt tốt nhất).
- Toàn bộ logic xử lý và nhận diện được đưa lên Frontend (`App.tsx`), không làm nặng Backend hay AI Server.

## 2. Logic hoạt động (Keyword Spotting)
- Người dùng bấm nút Mic $\rightarrow$ Trình duyệt thu âm $\rightarrow$ Chuyển thành văn bản.
- Đoạn văn bản được chuẩn hóa (đưa về chữ thường, xóa dấu câu, khoảng trắng thừa).
- Dò tìm từ khóa trong câu nói dựa trên từ điển cho sẵn. Mạch Yolo:Bit chỉ cần nhận chính xác lệnh đã lọc (không cần parse câu dài).
- Tích hợp Popup UI trực quan góc phải dưới: Hiển thị trạng thái đang nghe, in ra câu user vừa nói, và báo đỏ/xanh tùy theo việc có bắt trúng từ khóa hay không.

## 3. Cấu hình lệnh (Đã cập nhật)
Thuộc tính `intent` đã được đồng bộ để khớp chính xác với lệnh mà Yolo:Bit cần nhận. 

```javascript
const VALID_COMMANDS = [
  { intent: "bật đèn", keywords: ["bật đèn", "mở đèn", "sáng đèn"] },
  { intent: "tắt đèn", keywords: ["tắt đèn", "tối đèn"] },
  { intent: "bật quạt", keywords: ["bật quạt", "mở quạt"] },
  { intent: "tắt quạt", keywords: ["tắt quạt", "đóng quạt"] }
];