namespace RestaurantOrdering.Api.DTOs.MenuItem;

public class MenuItemResponse
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public required string CategoryName { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}