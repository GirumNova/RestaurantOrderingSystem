using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Staff;

public sealed class CreateStaffRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; init; }

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string Email { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public required string Password { get; init; }

    [Required]
    [MinLength(1)]
    public required List<CreateStaffMemberRequest> Members { get; init; }
}

public sealed class CreateStaffMemberRequest
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