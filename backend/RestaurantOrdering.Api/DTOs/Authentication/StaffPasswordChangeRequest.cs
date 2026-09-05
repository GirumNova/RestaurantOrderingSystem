using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Authentication;

public sealed class StaffPasswordChangeRequest
{
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string StaffEmail { get; init; }

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string RequesterEmail { get; init; }
}