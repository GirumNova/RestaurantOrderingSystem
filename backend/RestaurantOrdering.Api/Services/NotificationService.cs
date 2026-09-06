using Microsoft.AspNetCore.SignalR;
using RestaurantOrdering.Api.Hubs;
using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Services;

public sealed class NotificationService : INotificationService
{
    private readonly IHubContext<OrderHub> _hubContext;

    public NotificationService(IHubContext<OrderHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyManagerPasswordChangeRequestAsync(
        PasswordChangeRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        await _hubContext.Clients
            .Group("Managers")
            .SendAsync(
                "PasswordChangeRequested",
                new
                {
                    requestId = request.Id,
                    accountId = request.AccountId,
                    requesterMemberId =
                        request.RequestedByMemberId,
                    requestedAtUtc =
                        request.RequestedAtUtc
                });
    }

    public async Task NotifyStaffPasswordChangedAsync(
        int accountId,
        string staffName)
    {
        await _hubContext.Clients
            .Group($"Staff:{accountId}")
            .SendAsync(
                "StaffPasswordChanged",
                new
                {
                    accountId,
                    staffName,
                    message =
                        "Your Staff account password has been changed. Please check your email for the new credentials."
                });
    }
    public async Task NotifyCategoryCreatedAsync(
    object category)
{
    ArgumentNullException.ThrowIfNull(category);

    await _hubContext.Clients
        .All
        .SendAsync(
            "CategoryCreated",
            category);
}

public async Task NotifyCategoryUpdatedAsync(
    object category)
{
    ArgumentNullException.ThrowIfNull(category);

    await _hubContext.Clients
        .All
        .SendAsync(
            "CategoryUpdated",
            category);
}

public async Task NotifyCategoryDeletedAsync(
    int categoryId)
{
    await _hubContext.Clients
        .All
        .SendAsync(
            "CategoryDeleted",
            categoryId);
}
public async Task NotifyMenuItemCreatedAsync(
    object menuItem)
{
    ArgumentNullException.ThrowIfNull(menuItem);

    await _hubContext.Clients
        .All
        .SendAsync(
            "MenuItemCreated",
            menuItem);
}

public async Task NotifyMenuItemUpdatedAsync(
    object menuItem)
{
    ArgumentNullException.ThrowIfNull(menuItem);

    await _hubContext.Clients
        .All
        .SendAsync(
            "MenuItemUpdated",
            menuItem);
}

public async Task NotifyMenuItemDeletedAsync(
    int menuItemId)
{
    await _hubContext.Clients
        .All
        .SendAsync(
            "MenuItemDeleted",
            menuItemId);
}
}