using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Category;

public class CreateCategoryRequest
{
    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public int DisplayOrder { get; set; }
}