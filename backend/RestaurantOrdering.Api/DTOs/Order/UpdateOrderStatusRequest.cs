using System.ComponentModel.DataAnnotations;
using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.DTOs.Order;

public class UpdateOrderStatusRequest
{
    [Required]
    [EnumDataType(typeof(OrderStatus))]
    public OrderStatus Status { get; set; }

    [MaxLength(500)]
    public string? RejectionReason { get; set; }
}