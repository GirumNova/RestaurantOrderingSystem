using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.Models;

public class Account
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string Email { get; set; }

    public required string PasswordHash { get; set; }

    public UserRole Role { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<StaffMember> StaffMembers { get; set; } = new List<StaffMember>();
}