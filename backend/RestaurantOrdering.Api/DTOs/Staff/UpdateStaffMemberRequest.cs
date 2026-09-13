using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Staff;

public sealed class UpdateStaffMemberRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string FullName { get; init; }

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string Email { get; init; }

    [StringLength(20)]
    public string? PhoneNumber { get; init; }

    [StringLength(100)]
    public string? Position { get; init; }
}