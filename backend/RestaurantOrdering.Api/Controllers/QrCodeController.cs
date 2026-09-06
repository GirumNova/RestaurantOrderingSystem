using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantOrdering.Api.Services;

namespace RestaurantOrdering.Api.Controllers;

[ApiController]
[Route("api/qr-code")]
public sealed class QrCodeController : ControllerBase
{
    private readonly IQrCodeService _qrCodeService;

    public QrCodeController(IQrCodeService qrCodeService)
    {
        _qrCodeService = qrCodeService;
    }

    // Manager: get the current active QR code
    [Authorize(Roles = "Manager")]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var qrCode = await _qrCodeService.GetOrCreateAsync();

        return Ok(new
        {
            qrCode.Id,
            qrCode.Token,
            qrCode.IsActive,
            qrCode.CreatedAtUtc,
            qrCode.UpdatedAtUtc,
            qrCode.ExpiresAtUtc
        });
    }

    // Manager: generate a new QR code
    // The previous QR remains valid for 24 hours.
    [Authorize(Roles = "Manager")]
    [HttpPost("generate")]
    public async Task<IActionResult> Generate()
    {
        var qrCode = await _qrCodeService.GenerateNewAsync();

        return Ok(new
        {
            qrCode.Id,
            qrCode.Token,
            qrCode.IsActive,
            qrCode.CreatedAtUtc,
            qrCode.UpdatedAtUtc,
            qrCode.ExpiresAtUtc
        });
    }

    // Manager: enable or disable the current QR code
    [Authorize(Roles = "Manager")]
    [HttpPut("status")]
    public async Task<IActionResult> SetStatus(
        [FromBody] SetQrCodeStatusRequest request)
    {
        var qrCode = await _qrCodeService.SetActiveAsync(
            request.IsActive
        );

        return Ok(new
        {
            qrCode.Id,
            qrCode.Token,
            qrCode.IsActive,
            qrCode.CreatedAtUtc,
            qrCode.UpdatedAtUtc,
            qrCode.ExpiresAtUtc
        });
    }

    // Customer: validate a QR code
    [AllowAnonymous]
    [HttpGet("{token}")]
    public async Task<IActionResult> Validate(string token)
    {
        var isValid = await _qrCodeService.ValidateAsync(token);

        if (!isValid)
        {
            return NotFound(new
            {
                message =
                    "This restaurant menu is currently unavailable."
            });
        }

        return Ok(new
        {
            isActive = true
        });
    }
}

public sealed class SetQrCodeStatusRequest
{
    public bool IsActive { get; set; }
}