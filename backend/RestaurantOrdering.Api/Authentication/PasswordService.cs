using Microsoft.AspNetCore.Identity;
using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Authentication;

public sealed class PasswordService : IPasswordService
{
    private readonly IPasswordHasher<Account> _passwordHasher;

    public PasswordService(IPasswordHasher<Account> passwordHasher)
    {
        _passwordHasher = passwordHasher;
    }

    public string HashPassword(Account account, string password)
    {
        ArgumentNullException.ThrowIfNull(account);

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException(
                "Password cannot be empty.",
                nameof(password));
        }

        return _passwordHasher.HashPassword(account, password);
    }

    public bool VerifyPassword(Account account, string password)
    {
        ArgumentNullException.ThrowIfNull(account);

        if (string.IsNullOrWhiteSpace(password))
        {
            return false;
        }

        var result = _passwordHasher.VerifyHashedPassword(
            account,
            account.PasswordHash,
            password);

        return result == PasswordVerificationResult.Success ||
               result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}