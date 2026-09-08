using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.DTOs.Order;

public class OrderStatusResponse
{
    public required string OrderNumber { get; set; }

    public OrderStatus Status { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}