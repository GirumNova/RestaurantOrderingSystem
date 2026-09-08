using System.ComponentModel.DataAnnotations;

namespace RestaurantOrdering.Api.DTOs.Order;

public class CreateOrderItemRequest
{
    [Required]
    public int MenuItemId { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; }
}