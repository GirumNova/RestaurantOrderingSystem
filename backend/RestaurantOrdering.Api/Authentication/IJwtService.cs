using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Authentication;

public interface IJwtService
{
    string GenerateToken(Account account);
}