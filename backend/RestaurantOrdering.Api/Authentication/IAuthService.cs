using RestaurantOrdering.Api.DTOs.Authentication;

namespace RestaurantOrdering.Api.Authentication;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}