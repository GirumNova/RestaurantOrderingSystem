namespace RestaurantOrdering.Api.Models;

public class RestaurantQrCode
{
    public int Id { get; set; }

    public required string Token { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public DateTime? ExpiresAtUtc { get; set; }
}