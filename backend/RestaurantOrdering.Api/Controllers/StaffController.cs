using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantOrdering.Api.DTOs.Staff;
using RestaurantOrdering.Api.Services;
using RestaurantOrdering.Api.DTOs.Authentication;
namespace RestaurantOrdering.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager")]
public sealed class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    [HttpPost]
    public async Task<ActionResult<StaffResponse>> CreateStaff(
        CreateStaffRequest request)
    {
        try
        {
            var response = await _staffService.CreateStaffAsync(request);

            return CreatedAtAction(
                nameof(CreateStaff),
                new { id = response.AccountId },
                response);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
    [HttpPost("password-change-request")]

[AllowAnonymous]
public async Task<IActionResult> RequestPasswordChange(
    StaffPasswordChangeRequest request)
{
    try
    {
        await _staffService.RequestPasswordChangeAsync(request);

        return Ok(new
        {
            message = "Your password change request has been sent to the Manager."
        });
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
}
[HttpGet("password-change-requests")]
public async Task<ActionResult<
    List<PasswordChangeRequestResponse>>>
    GetPendingPasswordChangeRequests()
{
    var requests =
        await _staffService
            .GetPendingPasswordChangeRequestsAsync();

    return Ok(requests);
}
[HttpPost("password-change-requests/{requestId:int}/change-password")]
public async Task<IActionResult> ChangeStaffPassword(
    int requestId,
    ChangeStaffPasswordRequest request)
{
    try
    {
        await _staffService.ChangeStaffPasswordAsync(
            requestId,
            request);

        return Ok(new
        {
            message =
                "Staff password changed successfully and all active members were notified."
        });
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
}
}
