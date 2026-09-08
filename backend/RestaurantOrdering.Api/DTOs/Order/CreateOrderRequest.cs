using System.ComponentModel.DataAnnotations;
using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.DTOs.Order;

public class CreateOrderRequest
{
    [Required]
    [EnumDataType(typeof(OrderType))]
    public OrderType OrderType { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}