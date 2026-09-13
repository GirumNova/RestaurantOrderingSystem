using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace RestaurantOrdering.Api.Hubs;

public sealed class OrderHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var role = Context.User?
            .FindFirstValue(ClaimTypes.Role);

        if (role == "Manager")
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                "Managers");
        }
        else if (role == "Staff")
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                "Staff");
        }
        else
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                "Customers");
        }

        await base.OnConnectedAsync();
    }

    public async Task JoinOrderGroup(string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
        {
            throw new HubException(
                "Order number is required.");
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetOrderGroupName(orderNumber));
    }

    public async Task LeaveOrderGroup(string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
        {
            return;
        }

        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetOrderGroupName(orderNumber));
    }

    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        var role = Context.User?
            .FindFirstValue(ClaimTypes.Role);

        if (role == "Manager")
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                "Managers");
        }
        else if (role == "Staff")
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                "Staff");
        }
        else
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                "Customers");
        }

        await base.OnDisconnectedAsync(exception);
    }

    private static string GetOrderGroupName(
        string orderNumber)
    {
        return $"Order:{orderNumber.Trim().ToUpperInvariant()}";
    }
}