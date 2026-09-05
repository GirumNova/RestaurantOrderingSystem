using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<MenuItem> MenuItems { get; set; } =
        new List<MenuItem>();
}