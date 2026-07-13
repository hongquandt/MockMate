using System;
using System.Linq;
using Npgsql;

var connStr = "Host=ep-divine-truth-aov63r5t-pooler.c-2.ap-southeast-1.aws.neon.tech;" +
              "Database=neondb;Username=neondb_owner;Password=npg_r5WIK0SVXOcU;" +
              "SSL Mode=Require;Trust Server Certificate=true;";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
Console.WriteLine("✅ Kết nối Neon DB thành công!");

// --- Xóa tất cả PaymentTransactions ---
Console.WriteLine("\n🗑️ Xóa dữ liệu PaymentTransactions cũ...");
var cmdClear = new NpgsqlCommand(@"DELETE FROM ""PaymentTransactions"";", conn);
int deleted = await cmdClear.ExecuteNonQueryAsync();
Console.WriteLine($"  ✅ Đã xóa {deleted} transactions cũ.");

// --- Bước 1: INSERT 30 Users ---
Console.WriteLine("\n📥 Đang insert 30 Users (nếu chưa có)...");

var userInserts = new (string fullName, string email, string phone, int expYears, bool isVip, string createdAt)[]
{
    ("Nguyễn Minh Tuấn",    "tuan.nguyenminh@gmail.com",   "0912345678", 2, true,  "2026-05-10 08:30:00"),
    ("Trần Thị Lan Anh",    "lananh.tran@gmail.com",        "0987654321", 1, true,  "2026-05-12 09:15:00"),
    ("Lê Hoàng Phúc",       "phuc.lehoang@outlook.com",     "0971234567", 3, true,  "2026-05-15 10:00:00"),
    ("Phạm Thị Thu Hà",     "thuha.pham@gmail.com",         "0965432109", 0, false, "2026-05-18 11:20:00"),
    ("Võ Quốc Hùng",        "hung.voquoc@yahoo.com",        "0934567890", 4, true,  "2026-05-20 08:45:00"),
    ("Đặng Ngọc Bảo Châu",  "baochau.dang@gmail.com",       "0908765432", 1, true,  "2026-05-22 13:00:00"),
    ("Hoàng Văn Dũng",      "dung.hoangvan@gmail.com",      "0946789012", 5, false, "2026-05-25 14:30:00"),
    ("Nguyễn Thị Mỹ Duyên", "myduyen.nguyen@gmail.com",     "0979012345", 2, true,  "2026-05-26 15:10:00"),
    ("Bùi Thanh Long",      "long.buithanh@gmail.com",      "0923456789", 3, true,  "2026-05-28 09:00:00"),
    ("Trịnh Khánh Linh",    "khanhlinhh.trinh@gmail.com",   "0956781234", 0, false, "2026-05-29 10:45:00"),
    ("Đinh Quang Hải",      "hai.dinhquang@outlook.com",    "0918901234", 6, true,  "2026-05-30 11:30:00"),
    ("Lý Thị Cẩm Tú",       "camtu.ly@gmail.com",           "0982345678", 1, true,  "2026-06-01 08:00:00"),
    ("Phan Văn Khoa",       "khoa.phanvan@gmail.com",       "0945678901", 2, false, "2026-06-01 09:30:00"),
    ("Mai Thị Hồng Nhung",  "hongnhung.mai@gmail.com",      "0961234567", 0, false, "2026-06-02 10:15:00"),
    ("Vũ Đức Thắng",        "thang.vuduc@gmail.com",        "0937890123", 4, true,  "2026-06-02 14:00:00"),
    ("Cao Thị Thanh Huyền", "thanhuyen.cao@gmail.com",      "0904567890", 1, true,  "2026-06-02 15:45:00"),
    ("Đỗ Minh Khải",        "khai.dominh@gmail.com",        "0928901234", 3, false, "2026-06-03 08:30:00"),
    ("Lê Thị Phương Thảo",  "phuongthao.le@gmail.com",      "0973456789", 2, true,  "2026-06-03 09:00:00"),
    ("Nguyễn Hoàng Nam",    "nam.nguyenhoang@gmail.com",    "0901112223", 1, true,  "2026-06-04 08:00:00"),
    ("Trần Ngọc Ánh",       "anh.tranngoc@gmail.com",       "0912223334", 2, true,  "2026-06-05 09:00:00"),
    ("Phạm Văn Đồng",       "dong.phamvan@gmail.com",       "0923334445", 3, true,  "2026-06-06 10:00:00"),
    ("Bùi Thị Lan",         "lan.buithi@gmail.com",         "0934445556", 1, true,  "2026-06-07 11:00:00"),
    ("Vũ Nhật Anh",         "anh.vunhat@gmail.com",         "0945556667", 2, true,  "2026-06-08 12:00:00"),
    ("Lê Đức Phát",         "phat.leduc@gmail.com",         "0956667778", 0, false, "2026-06-09 13:00:00"),
    ("Ngô Phương Liên",     "lien.ngophuong@gmail.com",     "0967778889", 4, true,  "2026-06-10 14:00:00"),
    ("Đoàn Khắc Việt",      "viet.doankhac@gmail.com",      "0978889990", 5, true,  "2026-06-11 15:00:00"),
    ("Tạ Minh Khuê",        "khue.taminh@gmail.com",        "0989990001", 1, true,  "2026-06-12 16:00:00"),
    ("Hà Quốc Bảo",         "bao.haquoc@gmail.com",         "0990001112", 2, true,  "2026-06-13 17:00:00"),
    ("Chu Thị Hoa",         "hoa.chuthi@gmail.com",         "0901234123", 3, false, "2026-06-14 18:00:00"),
    ("Đào Xuân Trường",     "truong.daoxuan@gmail.com",     "0912345234", 4, true,  "2026-06-15 19:00:00")
};

int usersInserted = 0;
int usersSkipped = 0;
foreach (var u in userInserts)
{
    var cmdUser = new NpgsqlCommand(@"
        INSERT INTO ""Users"" (""FullName"", ""Email"", ""PasswordHash"", ""PhoneNumber"", ""ExperienceYears"", ""IsVip"", ""RoleId"", ""CreatedAt"", ""IsDeleted"")
        VALUES (@fn, @em, @ph, @pn, @ey, @iv, 2, @ca, FALSE)
        ON CONFLICT (""Email"") DO NOTHING;
    ", conn);
    cmdUser.Parameters.AddWithValue("fn", u.fullName);
    cmdUser.Parameters.AddWithValue("em", u.email);
    cmdUser.Parameters.AddWithValue("ph", "$2a$11$dummyhashforseeding_mockmate");
    cmdUser.Parameters.AddWithValue("pn", u.phone);
    cmdUser.Parameters.AddWithValue("ey", u.expYears);
    cmdUser.Parameters.AddWithValue("iv", u.isVip);
    cmdUser.Parameters.AddWithValue("ca", DateTime.Parse(u.createdAt));

    int rows = await cmdUser.ExecuteNonQueryAsync();
    if (rows > 0) { usersInserted++; }
    else { usersSkipped++; }
}
Console.WriteLine($"  → Inserted: {usersInserted} mới | Skipped: {usersSkipped} đã có");

// --- Bước 2: INSERT 30 PaymentTransactions ---
Console.WriteLine("\n💳 Đang insert 30 PaymentTransactions (50,000 VNĐ/giao dịch)...");

var payments = new (string email, string code, int status, string date)[]
{
    ("tuan.nguyenminh@gmail.com",  "MOCKMATE-20260603-0001", 1, "2026-06-03 09:12:45"),
    ("lananh.tran@gmail.com",       "MOCKMATE-20260604-0002", 1, "2026-06-04 10:30:22"),
    ("phuc.lehoang@outlook.com",    "MOCKMATE-20260604-0003", 1, "2026-06-04 14:05:17"),
    ("thuha.pham@gmail.com",        "MOCKMATE-20260605-0004", 1, "2026-06-05 08:55:33"),
    ("hung.voquoc@yahoo.com",       "MOCKMATE-20260606-0005", 1, "2026-06-06 11:20:58"),
    ("baochau.dang@gmail.com",      "MOCKMATE-20260609-0006", 1, "2026-06-09 09:44:10"),
    ("dung.hoangvan@gmail.com",     "MOCKMATE-20260610-0007", 1, "2026-06-10 13:15:05"),
    ("myduyen.nguyen@gmail.com",    "MOCKMATE-20260611-0008", 1, "2026-06-11 08:02:41"),
    ("long.buithanh@gmail.com",     "MOCKMATE-20260612-0009", 1, "2026-06-12 15:30:19"),
    ("khanhlinhh.trinh@gmail.com",  "MOCKMATE-20260613-0010", 1, "2026-06-13 10:48:55"),
    ("hai.dinhquang@outlook.com",   "MOCKMATE-20260616-0011", 1, "2026-06-16 09:05:27"),
    ("camtu.ly@gmail.com",          "MOCKMATE-20260617-0012", 1, "2026-06-17 11:33:14"),
    ("khoa.phanvan@gmail.com",      "MOCKMATE-20260618-0013", 1, "2026-06-18 14:50:02"),
    ("hongnhung.mai@gmail.com",     "MOCKMATE-20260619-0014", 1, "2026-06-19 08:20:36"),
    ("thang.vuduc@gmail.com",       "MOCKMATE-20260620-0015", 1, "2026-06-20 16:10:49"),
    ("thanhuyen.cao@gmail.com",     "MOCKMATE-20260623-0016", 1, "2026-06-23 10:05:03"),
    ("khai.dominh@gmail.com",       "MOCKMATE-20260627-0017", 1, "2026-06-27 13:22:47"),
    ("phuongthao.le@gmail.com",     "MOCKMATE-20260630-0018", 1, "2026-06-30 09:58:31"),
    ("nam.nguyenhoang@gmail.com",   "MOCKMATE-20260604-0019", 1, "2026-06-04 10:00:00"),
    ("anh.tranngoc@gmail.com",      "MOCKMATE-20260605-0020", 1, "2026-06-05 11:00:00"),
    ("dong.phamvan@gmail.com",      "MOCKMATE-20260606-0021", 1, "2026-06-06 12:00:00"),
    ("lan.buithi@gmail.com",        "MOCKMATE-20260607-0022", 1, "2026-06-07 13:00:00"),
    ("anh.vunhat@gmail.com",        "MOCKMATE-20260608-0023", 1, "2026-06-08 14:00:00"),
    ("phat.leduc@gmail.com",        "MOCKMATE-20260609-0024", 1, "2026-06-09 15:00:00"),
    ("lien.ngophuong@gmail.com",    "MOCKMATE-20260610-0025", 1, "2026-06-10 16:00:00"),
    ("viet.doankhac@gmail.com",     "MOCKMATE-20260611-0026", 1, "2026-06-11 17:00:00"),
    ("khue.taminh@gmail.com",       "MOCKMATE-20260612-0027", 1, "2026-06-12 18:00:00"),
    ("bao.haquoc@gmail.com",        "MOCKMATE-20260613-0028", 1, "2026-06-13 19:00:00"),
    ("hoa.chuthi@gmail.com",        "MOCKMATE-20260614-0029", 1, "2026-06-14 20:00:00"),
    ("truong.daoxuan@gmail.com",    "MOCKMATE-20260615-0030", 1, "2026-06-15 21:00:00")
};

int payInserted = 0;
foreach (var p in payments)
{
    var cmdPay = new NpgsqlCommand(@"
        INSERT INTO ""PaymentTransactions"" (""UserId"", ""TransactionCode"", ""Amount"", ""Status"", ""TransactionDate"")
        SELECT u.""Id"", @tc, 50000.00, @st, @td
        FROM ""Users"" u WHERE u.""Email"" = @em
        ON CONFLICT DO NOTHING;
    ", conn);
    cmdPay.Parameters.AddWithValue("tc", p.code);
    cmdPay.Parameters.AddWithValue("st", (short)p.status); // 1 = success
    cmdPay.Parameters.AddWithValue("td", DateTime.Parse(p.date));
    cmdPay.Parameters.AddWithValue("em", p.email);

    int rows = await cmdPay.ExecuteNonQueryAsync();
    if (rows > 0) payInserted++;
}
Console.WriteLine($"  → Đã insert {payInserted} PaymentTransactions mới.");

// Kiểm tra lại database
var cmdCount = new NpgsqlCommand(@"SELECT COUNT(*) FROM ""PaymentTransactions"";", conn);
var total = await cmdCount.ExecuteScalarAsync();
Console.WriteLine($"\n📊 Tổng số PaymentTransactions trong DB hiện tại: {total}");
