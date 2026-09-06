using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Category;

public class UpdateCategoryRequest
{
    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public int DisplayOrder { get; set; }
}