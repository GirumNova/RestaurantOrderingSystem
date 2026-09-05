namespace RestaurantOrdering.Api.DTOs.Staff;

public sealed class PasswordChangeRequestResponse
{
    public int RequestId { get; init; }

    public int AccountId { get; init; }

    public required string StaffName { get; init; }

    public required string StaffEmail { get; init; }

    public int RequestedByMemberId { get; init; }

    public required string RequestedByMemberName { get; init; }

    public required string RequestedByMemberEmail { get; init; }

    public DateTime RequestedAtUtc { get; init; }
}