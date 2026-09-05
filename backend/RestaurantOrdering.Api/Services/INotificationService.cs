using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Services;

public interface INotificationService
{
    Task NotifyManagerPasswordChangeRequestAsync(
        PasswordChangeRequest request);

    Task NotifyStaffPasswordChangedAsync(
        int accountId,
        string staffName);
}