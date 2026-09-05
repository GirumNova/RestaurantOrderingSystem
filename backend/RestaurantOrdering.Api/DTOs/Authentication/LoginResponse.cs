using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.DTOs.Authentication;

public sealed class LoginResponse
{
    public required string AccessToken { get; init; }

    public int AccountId { get; init; }

    public required string Name { get; init; }

    public required string Email { get; init; }

    public UserRole Role { get; init; }
}