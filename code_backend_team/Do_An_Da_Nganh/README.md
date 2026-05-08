# Backend SmartHome - Hướng dẫn dành cho nhóm


## Yêu cầu

- Node.js 18+ 
- PostgreSQL hoặc Neon Postgres
- MQTT broker cục bộ hoặc Adafruit IO
- `npm`

##  Cài đặt nhanh

Mở terminal và chạy:

```powershell
cd "code_backend_team/Do_An_Da_Nganh"
npm install
npm run prisma:generate
```

## Cấu hình môi trường

Sao chép file mẫu:

```powershell
copy .env.example .env
```

Sau đó chỉnh các giá trị phù hợp.

### Ví dụ `.env` chạy local
## Nhớ chỉnh lại ở DATABASE_URL cái pass với tên database PostgreSQL chạy ở local của aiem nha.
```env
PORT=3001
NODE_ENV=development

REQUIRE_DB=true
REQUIRE_MQTT=false

DATABASE_URL=postgresql://postgres:password@localhost:5432/smarthome_db?schema=public

JWT_SECRET=change_me_secret_key_123
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_refresh_key_456
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=smarthome-api
JWT_AUDIENCE=smarthome-client
AUTH_ALLOWED_ROLES=user,admin

MQTT_URL=mqtt://localhost:1883
MQTT_USERNAME= 
MQTT_PASSWORD=
MQTT_TOPIC_TELEMETRY=yolohome/telemetry
MQTT_TOPIC_CONTROL=yolohome/control
```

### Ví dụ `.env` dùng Adafruit IO. Tại dùng chung MQTT nên MQTT_USERNAME với MQTT_PASSWORD lấy chung của Huy.

```env
REQUIRE_MQTT=true
MQTT_URL=mqtts://io.adafruit.com:8883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_TOPIC_TELEMETRY=HuyGia/feeds/+
MQTT_TOPIC_CONTROL=HuyGia/feeds/button1,HuyGia/feeds/button2
```

### Ghi chú

- `REQUIRE_DB=true` bắt buộc server phải kết nối database khi khởi động.
- `REQUIRE_MQTT=true` bắt buộc server phải kết nối broker khi khởi động.
- Nếu aiem dùng broker local và không cần MQTT khi chạy, đặt `REQUIRE_MQTT=false`.

##  Chạy backend

### Chạy development

```powershell
npm run dev
```


### Kết quả nếu chạy juan

- Database connected (nếu `REQUIRE_DB=true`)
- MQTT connected (nếu `REQUIRE_MQTT=true`)
- Server listening port: 3001

## Kiến trúc chính

- `server.js`: khởi tạo Express, DB, MQTT, WebSocket.
- `src/app.js`: cấu hình middleware, route, error handler.
- `src/routes/api.js`: mount route `users`, `devices`, `environment`.
- `src/routes/user.routes.js`: auth và quản lý user.
- `src/routes/device.routes.js`: điều khiển thiết bị.
- `src/routes/environment.routes.js`: telemetry environment.
- `src/iot/mqttHandler.js`: xử lý MQTT, lưu DB, broadcast WS.
- `src/iot/wsHandler.js`: WebSocket realtime.
- `src/services/*`: logic linh tinh.

## Dùng Postman để test API

Base URL: `http://localhost:3001/api`

### Auth / User

#### Đăng ký

- Method: `POST`
- URL: `http://localhost:3001/api/users/register`
- Body:
  ```json
  {
    "username": "testuser",
    "displayName": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }
  ```

#### Đăng nhập

- Method: `POST`
- URL: `http://localhost:3001/api/users/login`
- Body:
  ```json
  {
    "identifier": "testuser",
    "password": "password123"
  }
  ```

#### Refresh token

- Method: `POST`
- URL: `http://localhost:3001/api/users/refresh`
- Body:
  ```json
  {
    "refreshToken": "<REFRESH_TOKEN>"
  }
  ```

#### Logout

- Method: `POST`
- URL: `http://localhost:3001/api/users/logout`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

#### Lấy thông tin user hiện tại

- Method: `GET`
- URL: `http://localhost:3001/api/users/me`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

#### Cập nhật user

- Method: `PATCH`
- URL: `http://localhost:3001/api/users/me`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

#### Đổi mật khẩu

- Method: `PATCH`
- URL: `http://localhost:3001/api/users/me/password`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

#### Admin user

- Method: `GET`
- URL: `http://localhost:3001/api/users`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

- Method: `GET`
- URL: `http://localhost:3001/api/users/:userId`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

- Method: `PATCH`
- URL: `http://localhost:3001/api/users/:userId/role`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

### Device

#### Lấy danh sách thiết bị

- Method: `GET`
- URL: `http://localhost:3001/api/devices`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

#### Điều khiển thiết bị

- Method: `POST`
- URL: `http://localhost:3001/api/devices/:id/control`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`
- Body:
  ```json
  {
    "action": "turn_on",
    "payload": { "source": "frontend" }
  }
  ```

### Environment

#### Dữ liệu mới nhất

- Method: `GET`
- URL: `http://localhost:3001/api/environment/latest`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

#### Snapshot

- Method: `GET`
- URL: `http://localhost:3001/api/environment/snapshot`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

#### Lịch sử

- Method: `GET`
- URL: `http://localhost:3001/api/environment/history`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`
- Query: `limit`, `from`, `to`, `roomId`

#### Dữ liệu theo phòng

- Method: `GET`
- URL: `http://localhost:3001/api/environment/rooms/latest`
- Header: `Authorization: Bearer <ACCESS_TOKEN>`



## lƯU í:

- Copy `.env.example` thành `.env` rồi chỉnh như trên kia
- Nếu muốn chạy local và không có MQTT, đặt `REQUIRE_MQTT=false`
- Dùng cùng broker MQTT, nế chia sẻ cấu hình broker của Huy
- API auth dùng route `/api/users/login` và `/api/users/register`

### CHẠY BACKEND:
cd .\code_backend_team\Do_An_Da_Nganh\
npm install                             
npm run dev                                                                                   

### CHẠY FRONTEND:
cd .\ui\ui\  
npm install
npm run dev

### PUSH prisma vào postgresql (nếu chưa làm)
npx prisma db push

### ĐỂ xem danh sách (vd như user, alert, devices)
npx prisma studio
