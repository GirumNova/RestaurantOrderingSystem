namespace RestaurantOrdering.Api.Authentication;

public sealed class JwtSettings
{
    public required string Issuer { get; init; }

    public required string Audience { get; init; }

    public required string Key { get; init; }

    public int ExpirationMinutes { get; init; } = 60;
}