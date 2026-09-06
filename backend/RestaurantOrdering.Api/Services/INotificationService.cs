using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Services;

public interface INotificationService
{
    Task NotifyManagerPasswordChangeRequestAsync(
        PasswordChangeRequest request);

    Task NotifyStaffPasswordChangedAsync(
        int accountId,
        string staffName);

    Task NotifyCategoryCreatedAsync(
        object category);

    Task NotifyCategoryUpdatedAsync(
        object category);

    Task NotifyCategoryDeletedAsync(
        int categoryId);

        Task NotifyMenuItemCreatedAsync(object menuItem);

Task NotifyMenuItemUpdatedAsync(object menuItem);

Task NotifyMenuItemDeletedAsync(int menuItemId);
}