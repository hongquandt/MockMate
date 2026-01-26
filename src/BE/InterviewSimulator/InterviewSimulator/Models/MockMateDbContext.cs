using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace InterviewSimulator.Models;

public partial class MockMateDbContext : DbContext
{
    public MockMateDbContext()
    {
    }

    public MockMateDbContext(DbContextOptions<MockMateDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CareerTask> CareerTasks { get; set; }

    public virtual DbSet<InterviewSession> InterviewSessions { get; set; }

    public virtual DbSet<JobCategory> JobCategories { get; set; }

    public virtual DbSet<JobPosition> JobPositions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SessionDetail> SessionDetails { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        var connectionString = configuration.GetConnectionString("DBDefault");

        optionsBuilder.UseSqlServer(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CareerTask>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CareerTa__3214EC0754A191E6");

            entity.Property(e => e.ResourceLink).HasMaxLength(500);
            entity.Property(e => e.Status).HasDefaultValue((byte)0);
            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(d => d.Session).WithMany(p => p.CareerTasks)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK_Tasks_Sessions");

            entity.HasOne(d => d.User).WithMany(p => p.CareerTasks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tasks_Users");
        });

        modelBuilder.Entity<InterviewSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Intervie__3214EC07FDB0FBC0");

            entity.HasIndex(e => e.UserId, "IX_Sessions_UserId");

            entity.Property(e => e.StartedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasDefaultValue((byte)0);

            entity.HasOne(d => d.JobPosition).WithMany(p => p.InterviewSessions)
                .HasForeignKey(d => d.JobPositionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sessions_Jobs");

            entity.HasOne(d => d.User).WithMany(p => p.InterviewSessions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sessions_Users");
        });

        modelBuilder.Entity<JobCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__JobCateg__3214EC075CD0F836");

            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<JobPosition>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__JobPosit__3214EC07251D81B3");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Title).HasMaxLength(100);

            entity.HasOne(d => d.Category).WithMany(p => p.JobPositions)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_JobPositions_Categories");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3214EC079D16F90C");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B6160419B7CE0").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<SessionDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SessionD__3214EC07F2C70D0B");

            entity.HasIndex(e => e.SessionId, "IX_Details_SessionId");

            entity.Property(e => e.AnswerAudioUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Session).WithMany(p => p.SessionDetails)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK_Details_Sessions");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC071C109775");

            entity.HasIndex(e => e.Email, "IX_Users_Email");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534420FDE55").IsUnique();

            entity.Property(e => e.AvatarUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CvUrl).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.ExperienceYears).HasDefaultValue(0);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(500);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.RoleId).HasDefaultValue(2);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Roles");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
