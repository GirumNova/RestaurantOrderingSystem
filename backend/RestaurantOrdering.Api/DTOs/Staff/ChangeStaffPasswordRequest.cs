using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Staff;

public sealed class ChangeStaffPasswordRequest
{
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public required string NewPassword { get; init; }
}