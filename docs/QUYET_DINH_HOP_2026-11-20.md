# Quyết định họp 20/11/2026 — Soát xét & ký hợp đồng

Ghi nhận từ buổi review bảng quyết định Legal (`BANG_QUYET_DINH_LEGAL.md`, review trên dynotator).
Tài liệu này tổng hợp các quyết định đã chốt và các đầu việc còn mở, gắn với các mục LP-xx trong `CLM_FUNCTIONAL_PROTOTYPE_SPEC_v1.0.md`.

## 1. Đã chốt

| # | Quyết định | Liên quan |
|---|-----------|-----------|
| 1 | Nhà cung cấp chữ ký số: **CMC** | LP-09 |
| 2 | SLA **không tính thứ 7 / Chủ Nhật** | LP-13 |
| 3 | Khi vendor đồng ý với hợp đồng ở bước Finalize → có thể Submit soát xét. **Không cần** upload evidence (email, ảnh) | — |
| 4 | Trong path 1: **lưu lại version cũ** kể cả khi đã upload version mới | — |
| 5 | Sửa nhỏ cũng **cần soát lại** toàn bộ | — |
| 6 | Phân công người soát xét **theo rule đã note**, không để Trưởng Legal tự phân công thủ công | — |
| 7 | FIN/ACC: **Anh Huy (Head of Accounting)** phụ trách | Route A/B |

## 2. Quyết định quan trọng về luồng ký

Cần **một chuỗi path mới cho chữ ký**, tương tự luồng Soát xét (F01). Criteria quyết định người ký:

- Department (phòng ban)
- Contract value (giá trị hợp đồng)
- Contract type (loại hợp đồng theo nội dung)

Ví dụ: IT → Thomas (CIO).

**Đầu việc:** Legal gửi lại **Matrix người ký theo từng loại hợp đồng** — dự kiến chốt Matrix trước khi go-live hệ thống. (Liên quan LP-08.)

## 3. Đầu việc còn mở / chờ Legal

| # | Việc | Ghi chú |
|---|------|---------|
| 1 | Route A → "Manager của phòng ban": **chưa define có phải HoD không** | Cần Legal xác nhận |
| 2 | Define rule extended cho flow Chuyên viên → Trưởng bộ phận: Legal đã có, **cần thêm FIN/ACC, Procurement** | — |
| 3 | Charter ghi Service (dịch vụ) không có Procurement — **thực tế có**. Legal sẽ check và trả lời các loại hợp đồng Procurement soát xét/review | LP-17 |
| 4 | Xác nhận lại: **D nằm trong C** theo quy trình soát xét hợp đồng (file chị Tiên gửi) | Route C/D, LP-02 |

## 4. Định hướng dài hạn (ghi nhận trong họp)

- Workflow **dynamic như n8n**: cấu hình động theo số lượng phòng duyệt, loại hợp đồng
- Platform là **nền tảng lưu trữ hợp đồng** — hiện tại gán hợp đồng **theo team (SAP, AID, ETA)**, không gán theo user

## Nguồn

- Review session: dynotator `MzGEn9x0Z_HsppkzXh0MFLvwg4E` (7 versions, 20/11/2026)
- Spec: `CLM_FUNCTIONAL_PROTOTYPE_SPEC_v1.0.md` — bảng LP-01..LP-19
