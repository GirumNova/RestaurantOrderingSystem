using RestaurantOrdering.Api.DTOs.MenuItem;

namespace RestaurantOrdering.Api.Services;

public interface IMenuItemService
{
    Task<List<MenuItemResponse>> GetAllAsync();

    Task<MenuItemResponse?> GetByIdAsync(int id);

Task<List<MenuItemResponse>> GetCustomerMenuAsync();
    Task<MenuItemResponse> CreateAsync(
        CreateMenuItemRequest request);

    Task<MenuItemResponse?> UpdateAsync(
        int id,
        UpdateMenuItemRequest request);

    Task<bool> DeleteAsync(int id);
}