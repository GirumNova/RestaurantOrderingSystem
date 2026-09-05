using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace RestaurantOrdering.Api.Hubs;

[Authorize(Roles = "Manager,Staff")]
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
            var accountId = Context.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (!string.IsNullOrWhiteSpace(accountId))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    $"Staff:{accountId}");
            }
        }

        await base.OnConnectedAsync();
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
            var accountId = Context.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (!string.IsNullOrWhiteSpace(accountId))
            {
                await Groups.RemoveFromGroupAsync(
                    Context.ConnectionId,
                    $"Staff:{accountId}");
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}