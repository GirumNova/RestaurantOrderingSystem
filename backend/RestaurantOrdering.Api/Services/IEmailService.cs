namespace RestaurantOrdering.Api.Services;

public interface IEmailService
{
    Task SendStaffCredentialsAsync(
        string recipientEmail,
        string recipientName,
        string staffName,
        string staffEmail,
        string password);
}