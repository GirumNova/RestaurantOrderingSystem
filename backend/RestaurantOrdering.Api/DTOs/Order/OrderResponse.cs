using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.DTOs.Order;

public class OrderResponse
{
    public required string OrderNumber { get; set; }

    public OrderType OrderType { get; set; }

    public OrderStatus Status { get; set; }

    public decimal SubtotalAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }

    public List<OrderItemResponse> Items { get; set; } = new();
}