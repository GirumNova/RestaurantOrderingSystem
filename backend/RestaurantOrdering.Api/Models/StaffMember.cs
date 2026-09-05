namespace RestaurantOrdering.Api.Models;

public class StaffMember
{
    public int Id { get; set; }

    public int AccountId { get; set; }

    // Person's full name
    public required string FullName { get; set; }

    // Email used only for sending Staff account credentials
    public required string Email { get; set; }

    // Useful for identifying/contacting the person
    public string? PhoneNumber { get; set; }

    // Information about their job
    public string? Position { get; set; }

    // Optional employee identifier
    // public string? EmployeeId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Account Account { get; set; } = null!;
}