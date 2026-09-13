
using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.DTOs.Order;
using RestaurantOrdering.Api.Models.Enums;
using Microsoft.AspNetCore.SignalR;
using RestaurantOrdering.Api.Hubs;
namespace RestaurantOrdering.Api.Services;

public sealed class OrderService : IOrderService
{
private readonly ApplicationDbContext _db;
private readonly IHubContext<OrderHub> _hubContext;

public OrderService(
    ApplicationDbContext db,
    IHubContext<OrderHub> hubContext)
{
    _db = db;
    _hubContext = hubContext;
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

var response = MapToResponse(order);

await _hubContext.Clients
    .Group("Staff")
    .SendAsync(
        "NewOrderCreated",
        response);

return response;
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}


public async Task<OrderResponse?> UpdateStatusAsync(
    string orderNumber,
    OrderStatus status,
    string? rejectionReason = null)
{
    var order = await _db.Orders
        .Include(o => o.OrderItems)
        .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

    if (order == null)
    {
        return null;
    }

    ValidateStatusTransition(
        order.Status,
        status,
        rejectionReason);

    order.Status = status;
    order.UpdatedAtUtc = DateTime.UtcNow;

    if (status == OrderStatus.Rejected)
    {
        order.RejectionReason = rejectionReason!.Trim();
    }
    else
    {
        order.RejectionReason = null;
    }

await _db.SaveChangesAsync();

var response = MapToResponse(order);

await _hubContext.Clients
    .Group($"Order:{order.OrderNumber}")
    .SendAsync(
        "OrderStatusUpdated",
        response);

await _hubContext.Clients
    .Group("Staff")
    .SendAsync(
        "OrderStatusUpdated",
        response);

await _hubContext.Clients
    .Group("Managers")
    .SendAsync(
        "OrderStatusUpdated",
        response);

return response;
}

private static void ValidateStatusTransition(
    OrderStatus currentStatus,
    OrderStatus newStatus,
    string? rejectionReason)
{
    if (currentStatus == OrderStatus.Pending)
    {
        if (newStatus == OrderStatus.Preparing)
        {
            return;
        }

        if (newStatus == OrderStatus.Rejected)
        {
            if (string.IsNullOrWhiteSpace(rejectionReason))
            {
                throw new InvalidOperationException(
                    "A rejection reason is required.");
            }

            return;
        }
    }

    if (currentStatus == OrderStatus.Preparing &&
        newStatus == OrderStatus.Ready)
    {
        return;
    }

    if (currentStatus == OrderStatus.Ready &&
        newStatus == OrderStatus.Completed)
    {
        return;
    }

    throw new InvalidOperationException(
        $"Invalid order status transition: {currentStatus} to {newStatus}.");
}
public async Task<List<OrderResponse>> GetStaffOrdersAsync()
{
    var orders = await _db.Orders
        .AsNoTracking()
        .Include(o => o.OrderItems)
        .Where(o =>
            o.Status == OrderStatus.Pending ||
            o.Status == OrderStatus.Preparing ||
            o.Status == OrderStatus.Ready ||
            o.Status == OrderStatus.Completed)
        .OrderBy(o => o.CreatedAtUtc)
        .ToListAsync();

    return orders
        .Select(MapToResponse)
        .ToList();
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