-- 1. Tạo Database
CREATE DATABASE MockMateDB;
GO
USE MockMateDB;
GO

-- =============================================
-- BẢNG QUẢN TRỊ & NGƯỜI DÙNG (ADMINISTRATION)
-- =============================================

-- 2. Bảng Roles (Quyền hạn)
CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE, -- Admin, Candidate
    Description NVARCHAR(200)
);

-- 3. Bảng Users (Người dùng)
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleId INT NOT NULL DEFAULT 2, -- Mặc định là Candidate
    
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    AvatarUrl NVARCHAR(500),
    PhoneNumber NVARCHAR(20),
    
    -- Dữ liệu CV để AI phân tích background
    CvUrl NVARCHAR(500),              -- Link file PDF trên Cloud
    CvExtractedText NVARCHAR(MAX),    -- Text đã convert từ PDF để gửi cho AI
    ExperienceYears INT DEFAULT 0,
    
    IsDeleted BIT DEFAULT 0,          -- Soft Delete: 0=Active, 1=Deleted
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    -- VIP Membership
    IsVip BIT DEFAULT 0,
    VipExpirationDate DATETIME2,
    
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- 3.1. Bảng PaymentTransactions (Lịch sử giao dịch)
CREATE TABLE PaymentTransactions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Status TINYINT NOT NULL,          -- 0: Pending, 1: Success, 2: Failed
    TransactionCode NVARCHAR(100),    -- Mã giao dịch từ cổng thanh toán

    CONSTRAINT FK_Transactions_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- =============================================
-- BẢNG DỮ LIỆU VIỆC LÀM (MASTER DATA)
-- =============================================

-- 4. Bảng JobCategories (Ngành nghề)
CREATE TABLE JobCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1 -- 1=Hiện, 0=Ẩn
);

-- 5. Bảng JobPositions (Vị trí)
CREATE TABLE JobPositions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,
    Title NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Requirements NVARCHAR(MAX), -- Prompt context cho AI (Yêu cầu kỹ năng)
    IsActive BIT DEFAULT 1,
    
    CONSTRAINT FK_JobPositions_Categories FOREIGN KEY (CategoryId) REFERENCES JobCategories(Id)
);

-- =============================================
-- BẢNG NGHIỆP VỤ CHÍNH (CORE BUSINESS)
-- =============================================

-- 6. Bảng InterviewSessions (Phiên phỏng vấn)
CREATE TABLE InterviewSessions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    JobPositionId INT NOT NULL,
    
    -- Settings (Map với Enum C#)
    DifficultyLevel TINYINT NOT NULL, -- 0:Beginner, 1:Intermediate, 2:Advanced
    DurationMode TINYINT NOT NULL,    -- 0:Short, 1:Standard, 2:Deep
    
    -- Trạng thái phiên
    Status TINYINT DEFAULT 0,         -- 0:Created, 1:InProgress, 2:Completed, 3:Cancelled
    
    -- Kết quả tổng hợp
    TotalScore FLOAT,                 -- Điểm TB (0-10)
    CareerFitRating TINYINT,          -- 0:Unknown, 1:Low, 2:Medium, 3:High
    OverallFeedback NVARCHAR(MAX),    -- Nhận xét tổng quan
    
    StartedAt DATETIME2 DEFAULT GETDATE(),
    EndedAt DATETIME2,
    
    CONSTRAINT FK_Sessions_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_Sessions_Jobs FOREIGN KEY (JobPositionId) REFERENCES JobPositions(Id),
    CONSTRAINT CK_TotalScore CHECK (TotalScore >= 0 AND TotalScore <= 10) -- Validate điểm
);

-- 7. Bảng SessionDetails (Chi tiết hội thoại)
CREATE TABLE SessionDetails (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SessionId INT NOT NULL,
    OrderIndex INT NOT NULL,          -- Thứ tự câu hỏi (1, 2, 3...)
    
    -- Nội dung
    QuestionContent NVARCHAR(MAX) NOT NULL,
    AnswerContent NVARCHAR(MAX),      -- User trả lời (Text)
    AnswerAudioUrl NVARCHAR(500),     -- User trả lời (Voice file path)
    
    -- Đánh giá chi tiết từ AI
    AiFeedback NVARCHAR(MAX),         -- Gợi ý sửa lỗi cho câu này
    Score FLOAT,                      -- Điểm câu này (0-10)
    
    -- Metrics
    TimeTakenSeconds INT,             -- Thời gian suy nghĩ
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_Details_Sessions FOREIGN KEY (SessionId) REFERENCES InterviewSessions(Id) ON DELETE CASCADE,
    CONSTRAINT CK_DetailScore CHECK (Score >= 0 AND Score <= 10)
);

-- 8. Bảng CareerTasks (Hướng nghiệp & Lộ trình)
CREATE TABLE CareerTasks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    SessionId INT NULL,               -- Có thể Null nếu là Task định kỳ
    
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),        -- Nội dung bài tập AI giao
    ResourceLink NVARCHAR(500),       -- Link tài liệu học tập
    
    Status TINYINT DEFAULT 0,         -- 0:Pending, 1:Done
    Deadline DATETIME2,
    CompletedAt DATETIME2,
    
    CONSTRAINT FK_Tasks_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_Tasks_Sessions FOREIGN KEY (SessionId) REFERENCES InterviewSessions(Id)
);

-- =============================================
-- INDEXING (TỐI ƯU HIỆU NĂNG)
-- =============================================
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Sessions_UserId ON InterviewSessions(UserId);
CREATE INDEX IX_Details_SessionId ON SessionDetails(SessionId);

-- =============================================
-- SEED DATA (DỮ LIỆU MẪU ĐỂ CHẠY THỬ)
-- =============================================

-- 1. Thêm Roles
INSERT INTO Roles (RoleName, Description) VALUES 
('Admin', N'Quản trị viên hệ thống'),
('Candidate', N'Người tìm việc / Sinh viên');

-- 2. Thêm Job Categories
INSERT INTO JobCategories (Name) VALUES (N'Information Technology'), (N'Marketing');

-- 3. Thêm Job Positions
INSERT INTO JobPositions (CategoryId, Title, Requirements) VALUES 
(1, N'.NET Backend Developer', N'C#, SQL Server, REST API, Clean Architecture'),
(1, N'React Frontend Developer', N'ReactJS, TypeScript, Redux, TailwindCSS');

GO
-- 1. Create Roles Table (Bảng Vai trò)
CREATE TABLE IF NOT EXISTS "Roles" (
    "Id" SERIAL PRIMARY KEY,
    "RoleName" VARCHAR(50) NOT NULL UNIQUE,
    "Description" VARCHAR(200)
);

-- Seed Initial Roles (Dữ liệu mẫu cho Role)
INSERT INTO "Roles" ("RoleName", "Description") VALUES ('Admin', 'Administrator') ON CONFLICT ("RoleName") DO NOTHING;
INSERT INTO "Roles" ("RoleName", "Description") VALUES ('User', 'Candidate/User') ON CONFLICT ("RoleName") DO NOTHING;


-- 2. Create Users Table (Bảng Người dùng)
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "FullName" VARCHAR(100),
    "Email" VARCHAR(100) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(500),
    "PhoneNumber" VARCHAR(20),
    "AvatarUrl" VARCHAR(500),
    "CvUrl" VARCHAR(500),
    "CvExtractedText" TEXT, -- Để lưu text trích xuất từ CV nếu cần
    "ExperienceYears" INT DEFAULT 0,
    "IsVip" BOOLEAN DEFAULT FALSE,
    "VipExpirationDate" TIMESTAMP,
    "RoleId" INT DEFAULT 2,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "IsDeleted" BOOLEAN DEFAULT FALSE,
    FOREIGN KEY ("RoleId") REFERENCES "Roles"("Id") ON DELETE SET DEFAULT
);


-- 3. Create JobCategories Table (Bảng Danh mục việc làm)
CREATE TABLE IF NOT EXISTS "JobCategories" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN DEFAULT TRUE
);


-- 4. Create JobPositions Table (Bảng Vị trí việc làm)
CREATE TABLE IF NOT EXISTS "JobPositions" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(100) NOT NULL,
    "CategoryId" INT NOT NULL,
    "IsActive" BOOLEAN DEFAULT TRUE,
    FOREIGN KEY ("CategoryId") REFERENCES "JobCategories"("Id") ON DELETE CASCADE
);


-- 5. Create InterviewSessions Table (Bảng Phiên phỏng vấn - QUAN TRỌNG)
CREATE TABLE IF NOT EXISTS "InterviewSessions" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT NOT NULL,
    "JobPositionId" INT NOT NULL,
    "DifficultyLevel" SMALLINT DEFAULT 0, -- 0: Easy, 1: Medium, 2: Hard
    "DurationMode" SMALLINT DEFAULT 0,    -- 0: Standard, 1: Quick
    "Status" SMALLINT DEFAULT 0,          -- 0: InProgress, 1: Completed
    "TotalScore" FLOAT,
    "CareerFitRating" SMALLINT,
    "OverallFeedback" TEXT,
    "CvAnalysisJson" TEXT,                -- CỘT MỚI: Lưu kết quả phân tích CV JSON
    "StartedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "EndedAt" TIMESTAMP,
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("JobPositionId") REFERENCES "JobPositions"("Id") ON DELETE CASCADE
);

-- Nếu bảng đã tồn tại nhưng thiếu cột CvAnalysisJson, lệnh này sẽ thêm nó vào (An toàn để chạy lại)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'InterviewSessions' AND column_name = 'CvAnalysisJson') THEN
        ALTER TABLE "InterviewSessions" ADD COLUMN "CvAnalysisJson" TEXT;
    END IF;
END $$;


-- 6. Create SessionDetails Table (Bảng Chi tiết câu hỏi/trả lời)
CREATE TABLE IF NOT EXISTS "SessionDetails" (
    "Id" SERIAL PRIMARY KEY,
    "SessionId" INT NOT NULL,
    "OrderIndex" INT NOT NULL,
    "QuestionContent" TEXT NOT NULL,
    "AnswerContent" TEXT,
    "AnswerAudioUrl" VARCHAR(500),
    "AiFeedback" TEXT,
    "Score" FLOAT,
    "TimeTakenSeconds" INT,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("SessionId") REFERENCES "InterviewSessions"("Id") ON DELETE CASCADE
);


-- 7. Create CareerTasks Table (Bảng Nhiệm vụ nghề nghiệp - Tùy chọn)
CREATE TABLE IF NOT EXISTS "CareerTasks" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT NOT NULL,
    "SessionId" INT,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "ResourceLink" VARCHAR(500),
    "Status" SMALLINT DEFAULT 0, -- 0: Pending, 1: Done
    "DueDate" TIMESTAMP,
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("SessionId") REFERENCES "InterviewSessions"("Id") ON DELETE SET NULL
);


-- 8. Create PaymentTransactions Table (Bảng Giao dịch thanh toán)
CREATE TABLE IF NOT EXISTS "PaymentTransactions" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT NOT NULL,
    "TransactionCode" VARCHAR(100),
    "Amount" DECIMAL(18, 2),
    "Status" SMALLINT DEFAULT 0, -- 0: Pending, 1: Success, 2: Failed
    "Description" TEXT,
    "TransactionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);
