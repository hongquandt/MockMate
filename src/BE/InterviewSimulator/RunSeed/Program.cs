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
    ("Vũ Đức Thắng",        "thang.vuduc@gmail.com",        "0937890123", 4, true,  "2026-06-20 10:00:00"),
    ("Cao Thị Thanh Huyền", "thanhuyen.cao@gmail.com",      "0904567890", 1, true,  "2026-06-22 09:00:00"),
    ("Đỗ Minh Khải",        "khai.dominh@gmail.com",        "0928901234", 3, false, "2026-06-25 08:30:00"),
    ("Lê Thị Phương Thảo",  "phuongthao.le@gmail.com",      "0973456789", 2, true,  "2026-06-28 14:00:00")
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

// --- Bước 2: INSERT PaymentTransactions ---
Console.WriteLine("\n💳 Đang insert PaymentTransactions (50,000 VNĐ/giao dịch)...");

var payments = new (string email, string code, int status, string date)[]
{
    ("thang.vuduc@gmail.com",       "MOCKMATE-20260620-0015", 1, "2026-06-20 16:10:49"),
    ("thanhuyen.cao@gmail.com",     "MOCKMATE-20260623-0016", 1, "2026-06-23 10:05:03"),
    ("khai.dominh@gmail.com",       "MOCKMATE-20260627-0017", 1, "2026-06-27 13:22:47"),
    ("phuongthao.le@gmail.com",     "MOCKMATE-20260630-0018", 1, "2026-06-30 09:58:31")
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
