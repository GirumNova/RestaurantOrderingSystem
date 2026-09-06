using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.MenuItem;

public class UpdateMenuItemRequest
{
    [Required]
    [MaxLength(150)]
    public required string Name { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Range(0, 999999.99)]
    public decimal Price { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; }
}