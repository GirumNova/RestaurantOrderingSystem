using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.Models;

public class MenuItem
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    [Required]
    [MaxLength(150)]
    public required string Name { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Range(0, 999999.99)]
    public decimal Price { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public Category Category { get; set; } = null!;
}