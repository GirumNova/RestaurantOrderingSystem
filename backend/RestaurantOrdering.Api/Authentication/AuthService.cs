using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.DTOs.Authentication;
using RestaurantOrdering.Api.Models;

namespace RestaurantOrdering.Api.Authentication;

public sealed class AuthService : IAuthService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;

    public AuthService(
        ApplicationDbContext dbContext,
        IPasswordService passwordService,
        IJwtService jwtService)
    {
        _dbContext = dbContext;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        var account = await _dbContext.Accounts
            .SingleOrDefaultAsync(account => account.Email == email);

        if (account is null || !account.IsActive)
        {
            return null;
        }

        var passwordValid = _passwordService.VerifyPassword(
            account,
            request.Password);

        if (!passwordValid)
        {
            return null;
        }

        var accessToken = _jwtService.GenerateToken(account);

        return new LoginResponse
        {
            AccessToken = accessToken,
            AccountId = account.Id,
            Name = account.Name,
            Email = account.Email,
            Role = account.Role
        };
    }
}