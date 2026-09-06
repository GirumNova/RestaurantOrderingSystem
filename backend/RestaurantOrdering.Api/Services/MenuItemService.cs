using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.DTOs.MenuItem;
using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Services;

public class MenuItemService : IMenuItemService
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notificationService;

    public MenuItemService(
        ApplicationDbContext db,
        INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<List<MenuItemResponse>> GetAllAsync()
    {
        return await _db.MenuItems
            .AsNoTracking()
            .OrderBy(m => m.Category.Name)
            .ThenBy(m => m.Name)
            .Select(m => new MenuItemResponse
            {
                Id = m.Id,
                CategoryId = m.CategoryId,
                CategoryName = m.Category.Name,
                Name = m.Name,
                Description = m.Description,
                Price = m.Price,
                ImageUrl = m.ImageUrl,
                IsAvailable = m.IsAvailable,
                CreatedAtUtc = m.CreatedAtUtc,
                UpdatedAtUtc = m.UpdatedAtUtc
            })
            .ToListAsync();
    }
    public async Task<List<MenuItemResponse>> GetCustomerMenuAsync()
{
    return await _db.MenuItems
        .AsNoTracking()
        .Where(m =>
            m.Category.IsActive &&
            m.IsAvailable)
        .OrderBy(m => m.Category.DisplayOrder)
        .ThenBy(m => m.Name)
        .Select(m => new MenuItemResponse
        {
            Id = m.Id,
            CategoryId = m.CategoryId,
            CategoryName = m.Category.Name,
            Name = m.Name,
            Description = m.Description,
            Price = m.Price,
            ImageUrl = m.ImageUrl,
            IsAvailable = m.IsAvailable,
            CreatedAtUtc = m.CreatedAtUtc,
            UpdatedAtUtc = m.UpdatedAtUtc
        })
        .ToListAsync();
}

    public async Task<MenuItemResponse?> GetByIdAsync(int id)
    {
        return await _db.MenuItems
            .AsNoTracking()
            .Where(m => m.Id == id)
            .Select(m => new MenuItemResponse
            {
                Id = m.Id,
                CategoryId = m.CategoryId,
                CategoryName = m.Category.Name,
                Name = m.Name,
                Description = m.Description,
                Price = m.Price,
                ImageUrl = m.ImageUrl,
                IsAvailable = m.IsAvailable,
                CreatedAtUtc = m.CreatedAtUtc,
                UpdatedAtUtc = m.UpdatedAtUtc
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MenuItemResponse> CreateAsync(
        CreateMenuItemRequest request)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

        if (category is null)
        {
            throw new InvalidOperationException(
                "The selected category does not exist.");
        }

        var menuItem = new MenuItem
        {
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl?.Trim(),
            IsAvailable = request.IsAvailable
        };

        _db.MenuItems.Add(menuItem);

        await _db.SaveChangesAsync();

        var response = new MenuItemResponse
        {
            Id = menuItem.Id,
            CategoryId = menuItem.CategoryId,
            CategoryName = category.Name,
            Name = menuItem.Name,
            Description = menuItem.Description,
            Price = menuItem.Price,
            ImageUrl = menuItem.ImageUrl,
            IsAvailable = menuItem.IsAvailable,
            CreatedAtUtc = menuItem.CreatedAtUtc,
            UpdatedAtUtc = menuItem.UpdatedAtUtc
        };

        await _notificationService.NotifyMenuItemCreatedAsync(
            response);

        return response;
    }

    public async Task<MenuItemResponse?> UpdateAsync(
        int id,
        UpdateMenuItemRequest request)
    {
        var menuItem = await _db.MenuItems
            .FirstOrDefaultAsync(m => m.Id == id);

        if (menuItem is null)
        {
            return null;
        }

        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

        if (category is null)
        {
            throw new InvalidOperationException(
                "The selected category does not exist.");
        }

        menuItem.CategoryId = request.CategoryId;
        menuItem.Name = request.Name.Trim();
        menuItem.Description = request.Description?.Trim();
        menuItem.Price = request.Price;
        menuItem.ImageUrl = request.ImageUrl?.Trim();
        menuItem.IsAvailable = request.IsAvailable;
        menuItem.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var response = new MenuItemResponse
        {
            Id = menuItem.Id,
            CategoryId = menuItem.CategoryId,
            CategoryName = category.Name,
            Name = menuItem.Name,
            Description = menuItem.Description,
            Price = menuItem.Price,
            ImageUrl = menuItem.ImageUrl,
            IsAvailable = menuItem.IsAvailable,
            CreatedAtUtc = menuItem.CreatedAtUtc,
            UpdatedAtUtc = menuItem.UpdatedAtUtc
        };

        await _notificationService.NotifyMenuItemUpdatedAsync(
            response);

        return response;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var menuItem = await _db.MenuItems
            .FirstOrDefaultAsync(m => m.Id == id);

        if (menuItem is null)
        {
            return false;
        }

        /*
         * For now, physical deletion is allowed.
         *
         * Once OrderItem is implemented, this method will be
         * updated to protect menu items used in historical orders.
         */

        _db.MenuItems.Remove(menuItem);

        await _db.SaveChangesAsync();

        await _notificationService.NotifyMenuItemDeletedAsync(id);

        return true;
    }
}