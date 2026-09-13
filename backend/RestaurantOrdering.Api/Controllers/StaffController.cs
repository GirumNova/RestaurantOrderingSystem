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

[HttpGet]
public async Task<ActionResult<List<StaffResponse>>> GetAllStaff()
{
    var staff = await _staffService.GetAllStaffAsync();

    return Ok(staff);
}
[HttpGet("{id:int}")]
public async Task<ActionResult<StaffResponse>> GetStaffById(
    int id)
{
    try
    {
        var staff = await _staffService.GetStaffByIdAsync(id);

        return Ok(staff);
    }
    catch (InvalidOperationException ex)
    {
        return NotFound(new
        {
            message = ex.Message
        });
    }
}

[HttpPut("{id:int}")]
public async Task<ActionResult<StaffResponse>> UpdateStaff(
    int id,
    UpdateStaffRequest request)
{
    try
    {
        return Ok(await _staffService.UpdateStaffAsync(id, request));
    }
    catch (InvalidOperationException ex)
    {
        return Conflict(new { message = ex.Message });
    }
}

[HttpPut("{id:int}/status")]
public async Task<IActionResult> UpdateStaffStatus(
    int id,
    [FromBody] bool isActive)
{
    try
    {
        await _staffService.UpdateStaffStatusAsync(id, isActive);
        return Ok(new { message = "Staff status updated successfully." });
    }
    catch (InvalidOperationException ex)
    {
        return NotFound(new { message = ex.Message });
    }
}

[HttpPost("{id:int}/members")]
public async Task<ActionResult<StaffMemberResponse>> AddStaffMember(
    int id,
    CreateStaffMemberRequest request)
{
    try
    {
        return Ok(await _staffService.AddStaffMemberAsync(id, request));
    }
    catch (InvalidOperationException ex)
    {
        return NotFound(new { message = ex.Message });
    }
}

[HttpPut("{id:int}/members/{memberId:int}")]
public async Task<ActionResult<StaffMemberResponse>> UpdateStaffMember(
    int id,
    int memberId,
    UpdateStaffMemberRequest request)
{
    try
    {
        return Ok(await _staffService.UpdateStaffMemberAsync(
            id, memberId, request));
    }
    catch (InvalidOperationException ex)
    {
        return NotFound(new { message = ex.Message });
    }
}

[HttpPut("{id:int}/members/{memberId:int}/status")]
public async Task<IActionResult> UpdateStaffMemberStatus(
    int id,
    int memberId,
    [FromBody] bool isActive)
{
    try
    {
        await _staffService.UpdateStaffMemberStatusAsync(
            id, memberId, isActive);

        return Ok(new { message = "Staff member status updated successfully." });
    }
    catch (InvalidOperationException ex)
    {
        return NotFound(new { message = ex.Message });
    }
}

[HttpDelete("{id:int}/members/{memberId:int}")]
public async Task<IActionResult> DeleteStaffMember(
    int id,
    int memberId)
{
    try
    {
        await _staffService.DeleteStaffMemberAsync(id, memberId);

        return Ok(new { message = "Staff member deleted successfully." });
    }
    catch (InvalidOperationException ex)
    {
        return NotFound(new { message = ex.Message });
    }
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
