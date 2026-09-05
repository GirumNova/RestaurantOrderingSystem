namespace RestaurantOrdering.Api.Models;

public class PasswordChangeRequest
{
    public int Id { get; set; }

    // The shared Staff account whose password needs to be changed
    public int AccountId { get; set; }

    // The individual StaffMember who submitted the request
    public int RequestedByMemberId { get; set; }

    // When the request was created
    public DateTime RequestedAtUtc { get; set; } = DateTime.UtcNow;

    // When the Manager resolved the request
    public DateTime? ResolvedAtUtc { get; set; }

    // Current status of the request
    public PasswordChangeRequestStatus Status { get; set; }
        = PasswordChangeRequestStatus.Pending;

    // The shared Staff account
    public Account Account { get; set; } = null!;

    // The individual person who requested the change
    public StaffMember RequestedByMember { get; set; } = null!;
}

public enum PasswordChangeRequestStatus
{
    Pending = 1,
    Resolved = 2
}