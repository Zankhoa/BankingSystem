# 🏦 Project Bank - Digital Banking & Interbank Transfer System

Một hệ thống Ngân hàng số toàn diện (Full-stack Digital Banking) mô phỏng các nghiệp vụ Core Banking thực tế. Dự án cung cấp giải pháp chuyển tiền nội bộ, chuyển tiền liên ngân hàng, quản lý lịch sử giao dịch và đối soát dữ liệu với hiệu năng cao.

Hệ thống được thiết kế theo tiêu chuẩn Enterprise, áp dụng **Clean Architecture**, **CQRS**, và **Domain-Driven Design (DDD)** nhằm đảm bảo tính mở rộng, dễ bảo trì và xử lý tải cao.

---

## 🚀 Tính Năng Nổi Bật (Key Features)

### 💳 Giao dịch & Thanh toán
* **Chuyển tiền nội bộ (Internal Transfer):** Xử lý giao dịch nhanh chóng trong cùng hệ thống với cơ chế lock tài khoản an toàn (ACID transaction).
* **Chuyển tiền liên ngân hàng (Interbank Transfer):** Mô phỏng kết nối với hệ thống NAPAS/Ngân hàng ngoài. Tự động truy vấn và hiển thị tên người thụ hưởng (Mock External Service).
* **Lịch sử giao dịch (Transaction History):** Hiển thị danh sách giao dịch vô tận (Infinite Scrolling), gom nhóm theo ngày, lọc theo khoảng thời gian (Date Range) và loại giao dịch (Tiền vào/Tiền ra).

### 📊 Thống kê & Tiện ích
* **Dashboard Tổng quan:** Trực quan hóa dữ liệu thu/chi và biến động số dư.
* **Quản lý danh bạ thụ hưởng:** Lưu trữ và tìm kiếm nhanh tài khoản thường xuyên giao dịch.
* **Thông báo Real-time:** Nhận cảnh báo biến động số dư và trạng thái giao dịch ngay lập tức (SignalR).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Kiến trúc Hệ thống (Architecture & Patterns)
* **Clean Architecture:** Phân tách rõ ràng các Core Domain, Application Logic và Infrastructure.
* **CQRS (Command Query Responsibility Segregation):** Tách biệt luồng đọc (Read) và ghi (Write) để tối ưu hiệu năng.
* **Domain-Driven Design (DDD):** Ràng buộc chặt chẽ các nghiệp vụ ngân hàng thông qua Entities, Value Objects và Aggregate Roots.

### Backend (Core API)
* **Framework:** ASP.NET Core Web API (.NET)
* **Cơ sở dữ liệu (Database):** SQL Server (Primary DB lưu trữ thông tin tài khoản, giao dịch)
* **Caching:** Redis (Tối ưu truy vấn dữ liệu tham chiếu, OTP, Session)
* **Message Broker:** RabbitMQ & Kafka (Xử lý bất đồng bộ cho hệ thống thông báo, ghi log giao dịch và đối soát dữ liệu chéo).
* **Real-time Communication:** SignalR

### Frontend (User Interface)
* **Framework:** ReactJS / Next.js
* **Styling:** Tailwind CSS (Giao diện chuẩn Modern Banking, Responsive design).
* **Animation:** Framer Motion (Micro-interactions, hiệu ứng mượt mà).
* **UI Components:** `react-datepicker` (Bộ lọc ngày tháng tùy chỉnh).

---

## ⚙️ Cấu Trúc Luồng Xử Lý Giao Dịch (Transaction Flow)

1. **Client Request:** Gửi yêu cầu chuyển tiền từ React App (đã validate form).
2. **API Gateway / Controller:** Tiếp nhận request, xác thực Token (JWT).
3. **Command Handler (CQRS):** * Kiểm tra số dư (Balance Check).
   * Tạo Transaction record trạng thái `PENDING`.
   * Gửi Message vào **RabbitMQ/Kafka** để xử lý trừ/cộng tiền bất đồng bộ nhằm đảm bảo tính toàn vẹn.
4. **Worker Service:** Đọc message, cập nhật số dư DB, chuyển trạng thái thành `SUCCESS` hoặc `FAILED`.
5. **Notification:** Bắn event qua SignalR về Frontend để báo "Ting ting".

---

## 💻 Hướng Dẫn Cài Đặt (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
* Node.js (v18+)
* .NET 8 SDK
* SQL Server
* Redis Server
* RabbitMQ (Khuyên dùng Docker: `docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management`)

### Cài đặt Frontend
```bash
# 1. Clone repository
git clone [https://github.com/your-username/zankhoa-bank.git](https://github.com/your-username/zankhoa-bank.git)

# 2. Di chuyển vào thư mục frontend
cd zankhoa-bank/frontend

# 3. Cài đặt các package cần thiết
npm install

# 4. Khởi động môi trường phát triển
npm run dev
