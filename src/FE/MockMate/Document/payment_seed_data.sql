-- =============================================
-- SEED DATA: PaymentTransactions (18 giao dịch)
-- Thời gian: 03/06/2026 - 30/06/2026
-- Khách hàng: Người Việt Nam
-- Lưu ý: UserId phải khớp với bảng Users đã có trong DB
-- =============================================

-- Bước 1: Thêm 18 users Việt Nam (nếu chưa tồn tại)
-- Giả sử RoleId = 2 (Candidate), ID sẽ tự tăng từ DB
INSERT INTO "Users" ("FullName", "Email", "PasswordHash", "PhoneNumber", "ExperienceYears", "IsVip", "RoleId", "CreatedAt", "IsDeleted") VALUES
('Nguyễn Minh Tuấn',    'tuan.nguyenminh@gmail.com',   '$2a$11$dummyhashforseeding001', '0912345678', 2, TRUE,  2, '2026-05-10 08:30:00', FALSE),
('Trần Thị Lan Anh',    'lananh.tran@gmail.com',        '$2a$11$dummyhashforseeding002', '0987654321', 1, TRUE,  2, '2026-05-12 09:15:00', FALSE),
('Lê Hoàng Phúc',       'phuc.lehoang@outlook.com',     '$2a$11$dummyhashforseeding003', '0971234567', 3, TRUE,  2, '2026-05-15 10:00:00', FALSE),
('Phạm Thị Thu Hà',     'thuha.pham@gmail.com',         '$2a$11$dummyhashforseeding004', '0965432109', 0, FALSE, 2, '2026-05-18 11:20:00', FALSE),
('Võ Quốc Hùng',        'hung.voquoc@yahoo.com',        '$2a$11$dummyhashforseeding005', '0934567890', 4, TRUE,  2, '2026-05-20 08:45:00', FALSE),
('Đặng Ngọc Bảo Châu',  'baochau.dang@gmail.com',       '$2a$11$dummyhashforseeding006', '0908765432', 1, TRUE,  2, '2026-05-22 13:00:00', FALSE),
('Hoàng Văn Dũng',      'dung.hoangvan@gmail.com',      '$2a$11$dummyhashforseeding007', '0946789012', 5, FALSE, 2, '2026-05-25 14:30:00', FALSE),
('Nguyễn Thị Mỹ Duyên', 'myduyen.nguyen@gmail.com',     '$2a$11$dummyhashforseeding008', '0979012345', 2, TRUE,  2, '2026-05-26 15:10:00', FALSE),
('Bùi Thanh Long',      'long.buithanh@gmail.com',      '$2a$11$dummyhashforseeding009', '0923456789', 3, TRUE,  2, '2026-05-28 09:00:00', FALSE),
('Trịnh Khánh Linh',    'khanhlinhh.trinh@gmail.com',   '$2a$11$dummyhashforseeding010', '0956781234', 0, FALSE, 2, '2026-05-29 10:45:00', FALSE),
('Đinh Quang Hải',      'hai.dinhquang@outlook.com',    '$2a$11$dummyhashforseeding011', '0918901234', 6, TRUE,  2, '2026-05-30 11:30:00', FALSE),
('Lý Thị Cẩm Tú',       'camtu.ly@gmail.com',           '$2a$11$dummyhashforseeding012', '0982345678', 1, TRUE,  2, '2026-06-01 08:00:00', FALSE),
('Phan Văn Khoa',       'khoa.phanvan@gmail.com',       '$2a$11$dummyhashforseeding013', '0945678901', 2, FALSE, 2, '2026-06-01 09:30:00', FALSE),
('Mai Thị Hồng Nhung',  'hongnhung.mai@gmail.com',      '$2a$11$dummyhashforseeding014', '0961234567', 0, FALSE, 2, '2026-06-02 10:15:00', FALSE),
('Vũ Đức Thắng',        'thang.vuduc@gmail.com',        '$2a$11$dummyhashforseeding015', '0937890123', 4, TRUE,  2, '2026-06-02 14:00:00', FALSE),
('Cao Thị Thanh Huyền', 'thanhuyen.cao@gmail.com',      '$2a$11$dummyhashforseeding016', '0904567890', 1, TRUE,  2, '2026-06-02 15:45:00', FALSE),
('Đỗ Minh Khải',        'khai.dominh@gmail.com',        '$2a$11$dummyhashforseeding017', '0928901234', 3, FALSE, 2, '2026-06-03 08:30:00', FALSE),
('Lê Thị Phương Thảo',  'phuongthao.le@gmail.com',      '$2a$11$dummyhashforseeding018', '0973456789', 2, TRUE,  2, '2026-06-03 09:00:00', FALSE);


-- =============================================
-- Bước 2: Thêm 18 PaymentTransactions
-- Dùng subquery để lấy UserId theo Email (an toàn hơn hardcode ID)
-- Amount: 199000 VNĐ (gói 1 tháng VIP MockMate)
-- Status: 1 = Success (thanh toán thành công)
-- =============================================

INSERT INTO "PaymentTransactions" ("UserId", "TransactionCode", "Amount", "Status", "TransactionDate") VALUES

-- Tuần 1 (03/06 - 08/06)
((SELECT "Id" FROM "Users" WHERE "Email" = 'tuan.nguyenminh@gmail.com'),
 'MOCKMATE-20260603-0001', 50000.00, 1, '2026-06-03 09:12:45'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'lananh.tran@gmail.com'),
 'MOCKMATE-20260604-0002', 50000.00, 1, '2026-06-04 10:30:22'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'phuc.lehoang@outlook.com'),
 'MOCKMATE-20260604-0003', 50000.00, 1, '2026-06-04 14:05:17'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'thuha.pham@gmail.com'),
 'MOCKMATE-20260605-0004', 50000.00, 2, '2026-06-05 08:55:33'),  -- Failed

((SELECT "Id" FROM "Users" WHERE "Email" = 'hung.voquoc@yahoo.com'),
 'MOCKMATE-20260606-0005', 50000.00, 1, '2026-06-06 11:20:58'),

-- Tuần 2 (09/06 - 15/06)
((SELECT "Id" FROM "Users" WHERE "Email" = 'baochau.dang@gmail.com'),
 'MOCKMATE-20260609-0006', 50000.00, 1, '2026-06-09 09:44:10'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'dung.hoangvan@gmail.com'),
 'MOCKMATE-20260610-0007', 50000.00, 1, '2026-06-10 13:15:05'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'myduyen.nguyen@gmail.com'),
 'MOCKMATE-20260611-0008', 50000.00, 1, '2026-06-11 08:02:41'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'long.buithanh@gmail.com'),
 'MOCKMATE-20260612-0009', 50000.00, 0, '2026-06-12 15:30:19'),  -- Pending

((SELECT "Id" FROM "Users" WHERE "Email" = 'khanhlinhh.trinh@gmail.com'),
 'MOCKMATE-20260613-0010', 50000.00, 1, '2026-06-13 10:48:55'),

-- Tuần 3 (16/06 - 22/06)
((SELECT "Id" FROM "Users" WHERE "Email" = 'hai.dinhquang@outlook.com'),
 'MOCKMATE-20260616-0011', 50000.00, 1, '2026-06-16 09:05:27'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'camtu.ly@gmail.com'),
 'MOCKMATE-20260617-0012', 50000.00, 1, '2026-06-17 11:33:14'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'khoa.phanvan@gmail.com'),
 'MOCKMATE-20260618-0013', 50000.00, 1, '2026-06-18 14:50:02'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'hongnhung.mai@gmail.com'),
 'MOCKMATE-20260619-0014', 50000.00, 1, '2026-06-19 08:20:36'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'thang.vuduc@gmail.com'),
 'MOCKMATE-20260620-0015', 50000.00, 2, '2026-06-20 16:10:49'),  -- Failed

-- Tuần 4 (23/06 - 30/06)
((SELECT "Id" FROM "Users" WHERE "Email" = 'thanhuyen.cao@gmail.com'),
 'MOCKMATE-20260623-0016', 50000.00, 1, '2026-06-23 10:05:03'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'khai.dominh@gmail.com'),
 'MOCKMATE-20260627-0017', 50000.00, 1, '2026-06-27 13:22:47'),

((SELECT "Id" FROM "Users" WHERE "Email" = 'phuongthao.le@gmail.com'),
 'MOCKMATE-20260630-0018', 50000.00, 1, '2026-06-30 09:58:31');


-- =============================================
-- Kiểm tra kết quả
-- =============================================
SELECT
    pt."Id",
    u."FullName"           AS "Họ và Tên",
    u."Email"              AS "Email",
    pt."TransactionCode"   AS "Mã giao dịch",
    pt."Amount"            AS "Số tiền (VNĐ)",
    CASE pt."Status"
        WHEN 0 THEN 'Pending'
        WHEN 1 THEN 'Success'
        WHEN 2 THEN 'Failed'
    END                    AS "Trạng thái",
    pt."TransactionDate"   AS "Ngày giao dịch"
FROM "PaymentTransactions" pt
JOIN "Users" u ON pt."UserId" = u."Id"
WHERE pt."TransactionDate" BETWEEN '2026-06-03' AND '2026-06-30 23:59:59'
ORDER BY pt."TransactionDate";
