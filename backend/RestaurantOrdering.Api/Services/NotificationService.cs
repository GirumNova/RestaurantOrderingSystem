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
}