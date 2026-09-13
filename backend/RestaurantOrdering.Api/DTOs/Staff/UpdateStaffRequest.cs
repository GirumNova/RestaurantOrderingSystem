using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Staff;

public sealed class UpdateStaffRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; init; }

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string Email { get; init; }
}