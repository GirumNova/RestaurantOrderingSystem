using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Services;

public interface IQrCodeService
{
    Task<RestaurantQrCode> GetOrCreateAsync();

    Task<RestaurantQrCode> GenerateNewAsync();

    Task<RestaurantQrCode> SetActiveAsync(bool isActive);

    Task<bool> ValidateAsync(string token);
}