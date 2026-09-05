using System.Net;
using System.Net.Mail;

namespace RestaurantOrdering.Api.Services;

public sealed class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendStaffCredentialsAsync(
        string recipientEmail,
        string recipientName,
        string staffName,
        string staffEmail,
        string password)
    {
        var host = _configuration["Email:SmtpHost"]
            ?? throw new InvalidOperationException(
                "Email SMTP host is not configured.");

        var port = int.Parse(
            _configuration["Email:SmtpPort"] ?? "587");

        var username = _configuration["Email:Username"]
            ?? throw new InvalidOperationException(
                "Email username is not configured.");

        var smtpPassword = _configuration["Email:Password"]
            ?? throw new InvalidOperationException(
                "Email password is not configured.");

        var fromEmail = _configuration["Email:FromEmail"]
            ?? username;

        var fromName = _configuration["Email:FromName"]
            ?? "Restaurant Ordering System";

        using var message = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = "Your Staff Account Password Has Been Changed",
            Body = $"""
                   Hello {recipientName},

                   The password for the shared Staff account "{staffName}" has been changed.

                   Staff login email:
                   {staffEmail}

                   New password:
                   {password}

                   Please keep these credentials secure.

                   Restaurant Ordering System
                   """,
            IsBodyHtml = false
        };

        message.To.Add(
            new MailAddress(recipientEmail, recipientName));

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(
                username,
                smtpPassword)
        };

        await client.SendMailAsync(message);
    }
}