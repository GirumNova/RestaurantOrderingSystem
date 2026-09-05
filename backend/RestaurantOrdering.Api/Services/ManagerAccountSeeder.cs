using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Authentication;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.Models;
using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.Services;

public sealed class ManagerAccountSeeder
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;

    public ManagerAccountSeeder(
        ApplicationDbContext dbContext,
        IPasswordService passwordService,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _passwordService = passwordService;
        _configuration = configuration;
    }

    public async Task SeedAsync()
    {
        var managerExists = await _dbContext.Accounts
            .AnyAsync(account => account.Role == UserRole.Manager);

        if (managerExists)
        {
            return;
        }

        var email = _configuration["InitialManager:Email"];
        var password = _configuration["InitialManager:Password"];
        var name = _configuration["InitialManager:Name"];

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException(
                "Initial Manager configuration is missing.");
        }

        var manager = new Account
        {
            Name = name.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = string.Empty,
            Role = UserRole.Manager,
            IsActive = true
        };

        manager.PasswordHash = _passwordService.HashPassword(
            manager,
            password);

        _dbContext.Accounts.Add(manager);

        await _dbContext.SaveChangesAsync();
    }
}