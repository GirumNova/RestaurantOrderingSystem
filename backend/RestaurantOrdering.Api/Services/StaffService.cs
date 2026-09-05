using Microsoft.EntityFrameworkCore;
using RestaurantOrdering.Api.Authentication;
using RestaurantOrdering.Api.Data;
using RestaurantOrdering.Api.DTOs.Staff;
using RestaurantOrdering.Api.Models;
using RestaurantOrdering.Api.Models.Enums;
using RestaurantOrdering.Api.DTOs.Authentication;
namespace RestaurantOrdering.Api.Services;

public sealed class StaffService : IStaffService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPasswordService _passwordService;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    public StaffService(
        ApplicationDbContext dbContext,
        IPasswordService passwordService,
        INotificationService notificationService,
        IEmailService emailService)
    {
        _dbContext = dbContext;
        _passwordService = passwordService;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task<List<PasswordChangeRequestResponse>>
    GetPendingPasswordChangeRequestsAsync()
{
    return await _dbContext.PasswordChangeRequests
        .AsNoTracking()
        .Where(request =>
            request.Status == PasswordChangeRequestStatus.Pending)
        .Include(request => request.Account)
        .Include(request => request.RequestedByMember)
        .Select(request => new PasswordChangeRequestResponse
        {
            RequestId = request.Id,
            AccountId = request.AccountId,
            StaffName = request.Account.Name,
            StaffEmail = request.Account.Email,
            RequestedByMemberId = request.RequestedByMemberId,
            RequestedByMemberName =
                request.RequestedByMember.FullName,
            RequestedByMemberEmail =
                request.RequestedByMember.Email,
            RequestedAtUtc = request.RequestedAtUtc
        })
        .OrderBy(request => request.RequestedAtUtc)
        .ToListAsync();
}
public async Task ChangeStaffPasswordAsync(
    int requestId,
    ChangeStaffPasswordRequest request)
{
    ArgumentNullException.ThrowIfNull(request);

    var passwordChangeRequest =
        await _dbContext.PasswordChangeRequests
            .Include(passwordRequest => passwordRequest.Account)
            .ThenInclude(account => account.StaffMembers)
            .Include(passwordRequest =>
                passwordRequest.RequestedByMember)
            .SingleOrDefaultAsync(passwordRequest =>
                passwordRequest.Id == requestId &&
                passwordRequest.Status ==
                    PasswordChangeRequestStatus.Pending);

    if (passwordChangeRequest is null)
    {
        throw new InvalidOperationException(
            "Password change request was not found or has already been resolved.");
    }

    var account = passwordChangeRequest.Account;

    if (!account.IsActive)
    {
        throw new InvalidOperationException(
            "The Staff account is inactive.");
    }

    account.PasswordHash = _passwordService.HashPassword(
        account,
        request.NewPassword);

    passwordChangeRequest.Status =
        PasswordChangeRequestStatus.Resolved;

    passwordChangeRequest.ResolvedAtUtc =
        DateTime.UtcNow;

    await _dbContext.SaveChangesAsync();

    var activeMembers = account.StaffMembers
        .Where(member => member.IsActive)
        .ToList();

    foreach (var member in activeMembers)
    {
        await _emailService.SendStaffCredentialsAsync(
            member.Email,
            member.FullName,
            account.Name,
            account.Email,
            request.NewPassword);
    }

    await _notificationService
        .NotifyStaffPasswordChangedAsync(
            account.Id,
            account.Name);
}
        public async Task<StaffResponse> CreateStaffAsync(
        CreateStaffRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var email = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _dbContext.Accounts
            .AnyAsync(account => account.Email == email);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var staffAccount = new Account
            {
                Name = request.Name.Trim(),
                Email = email,
                PasswordHash = string.Empty,
                Role = UserRole.Staff,
                IsActive = true
            };

            staffAccount.PasswordHash =
                _passwordService.HashPassword(
                    staffAccount,
                    request.Password);

            _dbContext.Accounts.Add(staffAccount);

            foreach (var memberRequest in request.Members)
            {
                var staffMember = new StaffMember
                {
                    Account = staffAccount,
                    FullName = memberRequest.FullName.Trim(),
                    Email = memberRequest.Email.Trim().ToLowerInvariant(),
                    PhoneNumber = memberRequest.PhoneNumber?.Trim(),
                    Position = memberRequest.Position?.Trim(),
                    IsActive = true
                };

                _dbContext.StaffMembers.Add(staffMember);
            }

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return new StaffResponse
            {
                AccountId = staffAccount.Id,
                Name = staffAccount.Name,
                Email = staffAccount.Email,
                IsActive = staffAccount.IsActive,
                Members = staffAccount.StaffMembers
                    .Select(member => new StaffMemberResponse
                    {
                        Id = member.Id,
                        FullName = member.FullName,
                        Email = member.Email,
                        PhoneNumber = member.PhoneNumber,
                        Position = member.Position,
                        IsActive = member.IsActive
                    })
                    .ToList()
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task RequestPasswordChangeAsync(
    StaffPasswordChangeRequest request)
{
    ArgumentNullException.ThrowIfNull(request);

    var staffEmail = request.StaffEmail.Trim().ToLowerInvariant();
    var requesterEmail = request.RequesterEmail.Trim().ToLowerInvariant();

    var staffAccount = await _dbContext.Accounts
        .Include(account => account.StaffMembers)
        .SingleOrDefaultAsync(account =>
            account.Email == staffEmail &&
            account.Role == UserRole.Staff &&
            account.IsActive);

    if (staffAccount is null)
    {
        throw new InvalidOperationException(
            "Invalid Staff account information.");
    }

    var requester = staffAccount.StaffMembers
        .SingleOrDefault(member =>
            member.Email == requesterEmail &&
            member.IsActive);

    if (requester is null)
    {
        throw new InvalidOperationException(
            "The requester does not belong to this Staff account.");
    }

    var pendingRequestExists = await _dbContext.PasswordChangeRequests
        .AnyAsync(passwordRequest =>
            passwordRequest.AccountId == staffAccount.Id &&
            passwordRequest.Status ==
                PasswordChangeRequestStatus.Pending);

    if (pendingRequestExists)
    {
        throw new InvalidOperationException(
            "A password change request is already pending.");
    }

    var passwordChangeRequest = new PasswordChangeRequest
    {
        AccountId = staffAccount.Id,
        RequestedByMemberId = requester.Id,
        Status = PasswordChangeRequestStatus.Pending,
        RequestedAtUtc = DateTime.UtcNow
    };

_dbContext.PasswordChangeRequests.Add(passwordChangeRequest);

await _dbContext.SaveChangesAsync();

await _notificationService
    .NotifyManagerPasswordChangeRequestAsync(
        passwordChangeRequest);
}
}