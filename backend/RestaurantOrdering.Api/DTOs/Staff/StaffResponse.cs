namespace RestaurantOrdering.Api.DTOs.Staff;

public sealed class StaffResponse
{
    public int AccountId { get; init; }

    public required string Name { get; init; }

    public required string Email { get; init; }

    public bool IsActive { get; init; }

    public List<StaffMemberResponse> Members { get; init; } = [];
}

public sealed class StaffMemberResponse
{
    public int Id { get; init; }

    public required string FullName { get; init; }

    public required string Email { get; init; }

    public string? PhoneNumber { get; init; }

    public string? Position { get; init; }

    public bool IsActive { get; init; }
}