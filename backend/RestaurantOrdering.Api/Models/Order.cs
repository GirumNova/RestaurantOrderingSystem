
using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.Models;

public class Order
{
    public int Id { get; set; }

    public required string OrderNumber { get; set; }

    public OrderType OrderType { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public decimal SubtotalAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } =
        new List<OrderItem>();
}

