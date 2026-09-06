using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Account> Accounts => Set<Account>();

    public DbSet<StaffMember> StaffMembers => Set<StaffMember>();

public DbSet<PasswordChangeRequest> PasswordChangeRequests =>
    Set<PasswordChangeRequest>();
public DbSet<Category> Categories => Set<Category>();

public DbSet<MenuItem> MenuItems => Set<MenuItem>();
public DbSet<RestaurantQrCode> RestaurantQrCodes => Set<RestaurantQrCode>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(account => account.Id);

            entity.Property(account => account.Name)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(account => account.Email)
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(account => account.Email)
                .IsUnique();

            entity.Property(account => account.PasswordHash)
                .IsRequired();

            entity.Property(account => account.Role)
                .IsRequired();

            entity.Property(account => account.IsActive)
                .IsRequired();

            entity.Property(account => account.CreatedAtUtc)
                .IsRequired();

            entity.HasMany(account => account.StaffMembers)
                .WithOne(member => member.Account)
                .HasForeignKey(member => member.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StaffMember>(entity =>
        {
            entity.HasKey(member => member.Id);

            entity.Property(member => member.FullName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(member => member.PhoneNumber)
                .HasMaxLength(20);

            entity.Property(member => member.Position)
                .HasMaxLength(100);

            entity.Property(member => member.IsActive)
                .IsRequired();

            entity.Property(member => member.CreatedAtUtc)
                .IsRequired();
        });
modelBuilder.Entity<Category>(entity =>
{
    entity.Property(c => c.Name)
        .HasMaxLength(100)
        .IsRequired();

    entity.Property(c => c.Description)
        .HasMaxLength(500);

    entity.HasIndex(c => c.Name)
        .IsUnique();
});

modelBuilder.Entity<MenuItem>(entity =>
{
    entity.Property(m => m.Name)
        .HasMaxLength(150)
        .IsRequired();

    entity.Property(m => m.Description)
        .HasMaxLength(1000);

    entity.Property(m => m.Price)
        .HasPrecision(18, 2);

    entity.Property(m => m.ImageUrl)
        .HasMaxLength(500);

    entity.HasOne(m => m.Category)
        .WithMany(c => c.MenuItems)
        .HasForeignKey(m => m.CategoryId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasIndex(m => m.CategoryId);
});
modelBuilder.Entity<PasswordChangeRequest>(entity =>
{
    entity.HasKey(request => request.Id);

    entity.Property(request => request.AccountId)
        .IsRequired();

    entity.Property(request => request.RequestedByMemberId)
        .IsRequired();

    entity.Property(request => request.RequestedAtUtc)
        .IsRequired();

    entity.Property(request => request.Status)
        .IsRequired();

    entity.HasOne(request => request.Account)
        .WithMany()
        .HasForeignKey(request => request.AccountId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(request => request.RequestedByMember)
        .WithMany()
        .HasForeignKey(request => request.RequestedByMemberId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasIndex(request => new
    {
        request.AccountId,
        request.Status
    });
});   

modelBuilder.Entity<RestaurantQrCode>()
    .HasIndex(q => q.Token)
    .IsUnique();

modelBuilder.Entity<RestaurantQrCode>()
    .Property(q => q.Token)
    .HasMaxLength(100)
    .IsRequired();
    
    }
}