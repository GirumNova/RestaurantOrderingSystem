namespace RestaurantOrdering.Api.DTOs.Order;

public class OrderItemResponse
{
    public int MenuItemId { get; set; }

    public required string ItemName { get; set; }

    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }

    public decimal LineTotal { get; set; }
}