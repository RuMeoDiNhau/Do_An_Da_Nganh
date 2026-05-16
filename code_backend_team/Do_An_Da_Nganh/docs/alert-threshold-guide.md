# Hướng Dẫn Cảnh Báo Nhiệt Độ & Khí Gas

## Cấu Trúc

Backend đã implement hệ thống alert tự động:
- Model `threshold` lưu ngưỡng cảnh báo (min/max cho từng metric)
- Model `alert` lưu các sự kiện cảnh báo khi vượt ngưỡng
- `ruleEngine.service.js` kiểm tra mỗi sensor reading
- Nếu vượt ngưỡng → tạo record trong bảng `alert`

## API Endpoints

### 1. Setup Threshold (Set Min/Max)

**POST `/api/environment/settings/thresholds`**

```bash
curl -X POST http://localhost:3001/api/environment/settings/thresholds \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "temperature_threshold",
    "min": 15,
    "max": 30,
    "enabled": true,
    "unit": "°C"
  }'
```

**Response:**
```json
{
  "data": {
    "thre_id": 1,
    "config_key": "temperature_threshold",
    "config_value": {
      "min": 15,
      "max": 30,
      "enabled": true,
      "unit": "°C"
    }
  },
  "message": "Threshold updated successfully"
}
```

### 2. Lấy Tất Cả Threshold

**GET `/api/environment/settings/thresholds`**

```bash
curl http://localhost:3001/api/environment/settings/thresholds \
  -H "Authorization: Bearer <token>"
```

### 3. Lấy Một Threshold

**GET `/api/environment/settings/thresholds/temperature_threshold`**

```bash
curl http://localhost:3001/api/environment/settings/thresholds/temperature_threshold \
  -H "Authorization: Bearer <token>"
```

### 4. Lấy Alerts Gần Đây

**GET `/api/environment/alerts?limit=50&hours=24&roomId=...`**

```bash
curl "http://localhost:3001/api/environment/alerts?limit=50&hours=24" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "data": [
    {
      "a_id": "uuid-1234",
      "a_type": "temperature_alert",
      "r_id": "room-uuid",
      "metadata": {
        "reason": "temperature too high (35 > 30)",
        "value": 35,
        "readingKind": "environment",
        "timestamp": "2026-05-15T10:30:00Z"
      },
      "time": "2026-05-15T10:30:00Z",
      "rooms": {
        "r_id": "room-uuid",
        "name": "Phòng Khách",
        "room_type": "living_room"
      }
    }
  ],
  "count": 1
}
```

### 5. Xoá Alert

**DELETE `/api/environment/alerts/uuid-1234`**

```bash
curl -X DELETE http://localhost:3001/api/environment/alerts/uuid-1234 \
  -H "Authorization: Bearer <token>"
```

## Cấu Hình Threshold Mặc Định

Chạy các POST request sau để setup:

### Temperature
```bash
curl -X POST http://localhost:3001/api/environment/settings/thresholds \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "temperature_threshold",
    "min": 16,
    "max": 32,
    "enabled": true,
    "unit": "°C"
  }'
```

### Humidity
```bash
curl -X POST http://localhost:3001/api/environment/settings/thresholds \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "humidity_threshold",
    "min": 30,
    "max": 80,
    "enabled": true,
    "unit": "%"
  }'
```

### Gas (Smoke)
```bash
curl -X POST http://localhost:3001/api/environment/settings/thresholds \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "gas_threshold",
    "min": null,
    "max": 50,
    "enabled": true,
    "unit": "ppm"
  }'
```

### Light
```bash
curl -X POST http://localhost:3001/api/environment/settings/thresholds \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "light_threshold",
    "min": 0,
    "max": 100,
    "enabled": true,
    "unit": "%"
  }'
```

## Luồng Hoạt Động

1. **MQTT nhận sensor data** từ Adafruit IO
2. **Backend subscribe** `HuyGia/feeds/+` → normalize → lưu DB
3. **Rule Engine kiểm tra** với `checkThreshold()`:
   - Đọc config từ bảng `threshold`
   - Compare với min/max
   - Nếu vượt → trigger alert
4. **Alert được tạo** với metadata (reason, value, timestamp)
5. **Frontend GET `/api/environment/alerts`** để show cảnh báo real-time
6. **WebSocket broadcast** (tùy chọn) khi có alert mới

## Lưu Ý

- **disabled**: Nếu set `enabled: false`, threshold không kiểm tra
- **min hoặc max**: Có thể set chỉ một trong hai (ví dụ gas chỉ có max)
- **unit**: Tùy chọn, chỉ để hiển thị

## Test Alert Bằng Postman

1. Set threshold: `POST /api/environment/settings/thresholds` với temp max=30
2. Publish sensor data từ Adafruit > 30°C
3. Check alerts: `GET /api/environment/alerts`
4. Sẽ thấy `temperature_alert` có reason "temperature too high"
