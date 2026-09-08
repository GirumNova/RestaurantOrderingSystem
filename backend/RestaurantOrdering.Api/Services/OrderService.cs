using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.DTOs.Order;

namespace RestaurantOrdering.Api.Services;

public sealed class OrderService : IOrderService
{
    private readonly ApplicationDbContext _db;

    public OrderService(ApplicationDbContext db)
    {
        _db = db;
    }

public async Task<OrderResponse> CreateAsync(
    CreateOrderRequest request)
{
    if (request.Items == null || request.Items.Count == 0)
    {
        throw new InvalidOperationException(
            "An order must contain at least one item.");
    }

    if (request.Items
        .GroupBy(item => item.MenuItemId)
        .Any(group => group.Count() > 1))
    {
        throw new InvalidOperationException(
            "The same menu item cannot appear more than once in an order.");
    }

    var menuItemIds = request.Items
        .Select(item => item.MenuItemId)
        .Distinct()
        .ToList();

    var menuItems = await _db.MenuItems
        .Include(item => item.Category)
        .Where(item => menuItemIds.Contains(item.Id))
        .ToListAsync();

    if (menuItems.Count != menuItemIds.Count)
    {
        throw new InvalidOperationException(
            "One or more menu items could not be found.");
    }

    foreach (var requestedItem in request.Items)
    {
        if (requestedItem.Quantity <= 0)
        {
            throw new InvalidOperationException(
                "Item quantity must be greater than zero.");
        }

        var menuItem = menuItems
            .First(item => item.Id == requestedItem.MenuItemId);

        if (!menuItem.IsAvailable)
        {
            throw new InvalidOperationException(
                $"The menu item '{menuItem.Name}' is currently unavailable.");
        }

        if (!menuItem.Category.IsActive)
        {
            throw new InvalidOperationException(
                $"The category for '{menuItem.Name}' is currently unavailable.");
        }
    }

    await using var transaction =
        await _db.Database.BeginTransactionAsync();

    try
    {
        var order = new Models.Order
        {
            OrderNumber = await GenerateOrderNumber(),
            OrderType = request.OrderType,
            Status = Models.Enums.OrderStatus.Pending,
            SubtotalAmount = 0,
            TaxAmount = 0,
            TotalAmount = 0
        };

        foreach (var requestedItem in request.Items)
        {
            var menuItem = menuItems
                .First(item => item.Id == requestedItem.MenuItemId);

            var lineTotal =
                menuItem.Price * requestedItem.Quantity;

            order.OrderItems.Add(new Models.OrderItem
            {
                MenuItemId = menuItem.Id,
                ItemName = menuItem.Name,
                UnitPrice = menuItem.Price,
                Quantity = requestedItem.Quantity,
                LineTotal = lineTotal
            });

            order.SubtotalAmount += lineTotal;
        }

        order.TaxAmount = 0;
        order.TotalAmount =
            order.SubtotalAmount + order.TaxAmount;

        _db.Orders.Add(order);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return MapToResponse(order);
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
private async Task<string> GenerateOrderNumber()
{
    while (true)
    {
        var orderNumber =
            $"ORD-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

        var exists = await _db.Orders
            .AnyAsync(o => o.OrderNumber == orderNumber);

        if (!exists)
        {
            return orderNumber;
        }
    }
}
private static OrderResponse MapToResponse(
    Models.Order order)
{
    return new OrderResponse
    {
        OrderNumber = order.OrderNumber,
        OrderType = order.OrderType,
        Status = order.Status,
        SubtotalAmount = order.SubtotalAmount,
        TaxAmount = order.TaxAmount,
        TotalAmount = order.TotalAmount,
        RejectionReason = order.RejectionReason,
        CreatedAtUtc = order.CreatedAtUtc,
        UpdatedAtUtc = order.UpdatedAtUtc,
        Items = order.OrderItems
            .Select(item => new OrderItemResponse
            {
                MenuItemId = item.MenuItemId,
                ItemName = item.ItemName,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity,
                LineTotal = item.LineTotal
            })
            .ToList()
    };
}
public async Task<OrderResponse?> GetByOrderNumberAsync(
    string orderNumber)
{
    var order = await _db.Orders
        .AsNoTracking()
        .Include(o => o.OrderItems)
        .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

    if (order == null)
    {
        return null;
    }

    return MapToResponse(order);
}
}