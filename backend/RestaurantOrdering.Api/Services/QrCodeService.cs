using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Services;

public sealed class QrCodeService : IQrCodeService
{
    private static readonly TimeSpan GracePeriod =
        TimeSpan.FromHours(24);

    private readonly ApplicationDbContext _db;

    public QrCodeService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<RestaurantQrCode> GetOrCreateAsync()
    {
        var qrCode = await _db.RestaurantQrCodes
            .Where(q => q.IsActive)
            .OrderByDescending(q => q.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (qrCode != null)
        {
            return qrCode;
        }

        qrCode = new RestaurantQrCode
        {
            Token = GenerateToken(),
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.RestaurantQrCodes.Add(qrCode);

        await _db.SaveChangesAsync();

        return qrCode;
    }

    public async Task<RestaurantQrCode> GenerateNewAsync()
    {
        var now = DateTime.UtcNow;

        var currentQrCodes = await _db.RestaurantQrCodes
            .Where(q => q.IsActive)
            .ToListAsync();

        foreach (var qrCode in currentQrCodes)
        {
            qrCode.ExpiresAtUtc = now.Add(GracePeriod);
            qrCode.UpdatedAtUtc = now;
        }

        var newQrCode = new RestaurantQrCode
        {
            Token = GenerateToken(),
            IsActive = true,
            CreatedAtUtc = now
        };

        _db.RestaurantQrCodes.Add(newQrCode);

        await _db.SaveChangesAsync();

        return newQrCode;
    }

    public async Task<RestaurantQrCode> SetActiveAsync(bool isActive)
    {
        var qrCode = await _db.RestaurantQrCodes
            .Where(q => q.IsActive)
            .OrderByDescending(q => q.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (qrCode == null)
        {
            qrCode = await GetOrCreateAsync();
        }

        qrCode.IsActive = isActive;
        qrCode.UpdatedAtUtc = DateTime.UtcNow;

        if (!isActive)
        {
            qrCode.ExpiresAtUtc = DateTime.UtcNow;
        }
        else
        {
            qrCode.ExpiresAtUtc = null;
        }

        await _db.SaveChangesAsync();

        return qrCode;
    }

    public async Task<bool> ValidateAsync(string token)
    {
        var qrCode = await _db.RestaurantQrCodes
            .FirstOrDefaultAsync(q => q.Token == token);

        if (qrCode == null)
        {
            return false;
        }

        if (!qrCode.IsActive)
        {
            return false;
        }

        if (qrCode.ExpiresAtUtc.HasValue &&
            qrCode.ExpiresAtUtc.Value <= DateTime.UtcNow)
        {
            qrCode.IsActive = false;
            qrCode.UpdatedAtUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return false;
        }

        return true;
    }

    private static string GenerateToken()
    {
        return Convert.ToHexString(
            RandomNumberGenerator.GetBytes(32)
        );
    }
}