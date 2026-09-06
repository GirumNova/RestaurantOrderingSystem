using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantOrdering.Api.DTOs.MenuItem;
using RestaurantOrdering.Api.Services;

namespace RestaurantOrdering.Api.Controllers;

[ApiController]
[Route("api/menu-items")]
public class MenuItemController : ControllerBase
{
    private readonly IMenuItemService _menuItemService;

    public MenuItemController(IMenuItemService menuItemService)
    {
        _menuItemService = menuItemService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<MenuItemResponse>>> GetAll()
    {
        var menuItems = await _menuItemService.GetAllAsync();

        return Ok(menuItems);
    }
    [HttpGet("customer")]
[AllowAnonymous]
public async Task<ActionResult<List<MenuItemResponse>>> GetCustomerMenu()
{
    var menuItems = await _menuItemService.GetCustomerMenuAsync();

    return Ok(menuItems);
}

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<MenuItemResponse>> GetById(int id)
    {
        var menuItem = await _menuItemService.GetByIdAsync(id);

        if (menuItem is null)
        {
            return NotFound(new
            {
                message = "Menu item not found."
            });
        }

        return Ok(menuItem);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<MenuItemResponse>> Create(
        CreateMenuItemRequest request)
    {
        try
        {
            var menuItem = await _menuItemService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = menuItem.Id },
                menuItem);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<MenuItemResponse>> Update(
        int id,
        UpdateMenuItemRequest request)
    {
        try
        {
            var menuItem = await _menuItemService.UpdateAsync(
                id,
                request);

            if (menuItem is null)
            {
                return NotFound(new
                {
                    message = "Menu item not found."
                });
            }

            return Ok(menuItem);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _menuItemService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Menu item not found."
                });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
}