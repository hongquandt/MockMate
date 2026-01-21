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
    
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id)
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