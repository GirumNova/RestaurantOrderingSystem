using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.DTOs.Category;
using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notificationService;
    public CategoryService(ApplicationDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<List<CategoryResponse>> GetAllAsync()
    {
        return await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                DisplayOrder = c.DisplayOrder,
                CreatedAtUtc = c.CreatedAtUtc,
                UpdatedAtUtc = c.UpdatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<CategoryResponse?> GetByIdAsync(int id)
    {
        return await _db.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                DisplayOrder = c.DisplayOrder,
                CreatedAtUtc = c.CreatedAtUtc,
                UpdatedAtUtc = c.UpdatedAtUtc
            })
            .FirstOrDefaultAsync();
    }

public async Task<CategoryResponse> CreateAsync(
    CreateCategoryRequest request)
{
    var nameExists = await _db.Categories
        .AnyAsync(c => c.Name == request.Name);

    if (nameExists)
    {
        throw new InvalidOperationException(
            "A category with this name already exists.");
    }

    var category = new Category
    {
        Name = request.Name.Trim(),
        Description = request.Description?.Trim(),
        IsActive = true,
        DisplayOrder = request.DisplayOrder
    };

    _db.Categories.Add(category);

    await _db.SaveChangesAsync();

    var response = new CategoryResponse
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description,
        IsActive = category.IsActive,
        DisplayOrder = category.DisplayOrder,
        CreatedAtUtc = category.CreatedAtUtc,
        UpdatedAtUtc = category.UpdatedAtUtc
    };

    await _notificationService.NotifyCategoryCreatedAsync(response);

    return response;
}

public async Task<CategoryResponse?> UpdateAsync(
    int id,
    UpdateCategoryRequest request)
{
    var category = await _db.Categories
        .FirstOrDefaultAsync(c => c.Id == id);

    if (category is null)
    {
        return null;
    }

    var nameExists = await _db.Categories
        .AnyAsync(c =>
            c.Id != id &&
            c.Name == request.Name);

    if (nameExists)
    {
        throw new InvalidOperationException(
            "A category with this name already exists.");
    }

    category.Name = request.Name.Trim();
    category.Description = request.Description?.Trim();
    category.IsActive = request.IsActive;
    category.DisplayOrder = request.DisplayOrder;
    category.UpdatedAtUtc = DateTime.UtcNow;

    await _db.SaveChangesAsync();

    var response = new CategoryResponse
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description,
        IsActive = category.IsActive,
        DisplayOrder = category.DisplayOrder,
        CreatedAtUtc = category.CreatedAtUtc,
        UpdatedAtUtc = category.UpdatedAtUtc
    };

    await _notificationService.NotifyCategoryUpdatedAsync(response);

    return response;
}
public async Task<bool> DeleteAsync(int id)
{
    var category = await _db.Categories
        .FirstOrDefaultAsync(c => c.Id == id);

    if (category is null)
    {
        return false;
    }

    var hasMenuItems = await _db.MenuItems
        .AnyAsync(m => m.CategoryId == id);

    if (hasMenuItems)
    {
        throw new InvalidOperationException(
            "This category cannot be deleted because it contains menu items. Move or delete the menu items first.");
    }

    var categoryId = category.Id;

    _db.Categories.Remove(category);

    await _db.SaveChangesAsync();

    await _notificationService.NotifyCategoryDeletedAsync(categoryId);

    return true;
}
}