using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RestaurantOrdering.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager")]
public sealed class ManagerController : ControllerBase
{
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        return Ok(new
        {
            message = "Manager authorization successful.",
            name = User.Identity?.Name,
            role = User.FindFirst(
                System.Security.Claims.ClaimTypes.Role)?.Value
        });
    }
}