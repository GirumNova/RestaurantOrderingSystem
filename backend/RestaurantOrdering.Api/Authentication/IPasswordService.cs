using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Authentication;

public interface IPasswordService
{
    string HashPassword(Account account, string password);

    bool VerifyPassword(Account account, string password);
}