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
    public async Task<List<StaffResponse>> GetAllStaffAsync()
    {
        return await _dbContext.Accounts
            .AsNoTracking()
            .Where(account => account.Role == UserRole.Staff)
            .Include(account => account.StaffMembers)
            .OrderBy(account => account.Name)
            .Select(account => new StaffResponse
            {
                AccountId = account.Id,
                Name = account.Name,
                Email = account.Email,
                IsActive = account.IsActive,
                Members = account.StaffMembers
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
            })
            .ToListAsync();
    }

    public async Task<StaffResponse> GetStaffByIdAsync(int accountId)
    {
        var staff = await _dbContext.Accounts
            .AsNoTracking()
            .Include(account => account.StaffMembers)
            .SingleOrDefaultAsync(account =>
                account.Id == accountId &&
                account.Role == UserRole.Staff);

        if (staff is null)
        {
            throw new InvalidOperationException(
                "Staff account was not found.");
        }

        return new StaffResponse
        {
            AccountId = staff.Id,
            Name = staff.Name,
            Email = staff.Email,
            IsActive = staff.IsActive,
            Members = staff.StaffMembers
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

    public async Task<StaffResponse> UpdateStaffAsync(
        int accountId,
        UpdateStaffRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var staff = await _dbContext.Accounts
            .SingleOrDefaultAsync(account =>
                account.Id == accountId &&
                account.Role == UserRole.Staff);

        if (staff is null)
        {
            throw new InvalidOperationException(
                "Staff account was not found.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _dbContext.Accounts
            .AnyAsync(account =>
                account.Email == email &&
                account.Id != accountId);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        staff.Name = request.Name.Trim();
        staff.Email = email;

        await _dbContext.SaveChangesAsync();

        return await GetStaffByIdAsync(accountId);
    }

    public async Task UpdateStaffStatusAsync(
        int accountId,
        bool isActive)
    {
        var staff = await _dbContext.Accounts
            .SingleOrDefaultAsync(account =>
                account.Id == accountId &&
                account.Role == UserRole.Staff);

        if (staff is null)
        {
            throw new InvalidOperationException(
                "Staff account was not found.");
        }

        staff.IsActive = isActive;

        await _dbContext.SaveChangesAsync();
    }

    public async Task<StaffMemberResponse> AddStaffMemberAsync(
        int accountId,
        CreateStaffMemberRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        var email = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _dbContext.StaffMembers
            .AnyAsync(member => member.Email == email);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "A staff member with this email already exists.");
        }
        var staff = await _dbContext.Accounts
            .SingleOrDefaultAsync(account =>
                account.Id == accountId &&
                account.Role == UserRole.Staff);

        if (staff is null)
        {
            throw new InvalidOperationException(
                "Staff account was not found.");
        }

        var member = new StaffMember
        {
            AccountId = accountId,
            FullName = request.FullName.Trim(),
            Email = email,
            PhoneNumber = request.PhoneNumber?.Trim(),
            Position = request.Position?.Trim(),
            IsActive = true
        };

        _dbContext.StaffMembers.Add(member);

        await _dbContext.SaveChangesAsync();

        return new StaffMemberResponse
        {
            Id = member.Id,
            FullName = member.FullName,
            Email = member.Email,
            PhoneNumber = member.PhoneNumber,
            Position = member.Position,
            IsActive = member.IsActive
        };
    }

    public async Task<StaffMemberResponse> UpdateStaffMemberAsync(
        int accountId,
        int memberId,
        UpdateStaffMemberRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var member = await _dbContext.StaffMembers
            .SingleOrDefaultAsync(member =>
                member.Id == memberId &&
                member.AccountId == accountId);

        if (member is null)
        {
            throw new InvalidOperationException(
                "Staff member was not found.");
        }

        member.FullName = request.FullName.Trim();
        member.Email = request.Email.Trim().ToLowerInvariant();
        member.PhoneNumber = request.PhoneNumber?.Trim();
        member.Position = request.Position?.Trim();

        await _dbContext.SaveChangesAsync();

        return new StaffMemberResponse
        {
            Id = member.Id,
            FullName = member.FullName,
            Email = member.Email,
            PhoneNumber = member.PhoneNumber,
            Position = member.Position,
            IsActive = member.IsActive
        };
    }

    public async Task UpdateStaffMemberStatusAsync(
        int accountId,
        int memberId,
        bool isActive)
    {
        var member = await _dbContext.StaffMembers
            .SingleOrDefaultAsync(member =>
                member.Id == memberId &&
                member.AccountId == accountId);

        if (member is null)
        {
            throw new InvalidOperationException(
                "Staff member was not found.");
        }

        member.IsActive = isActive;

        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteStaffMemberAsync(
        int accountId,
        int memberId)
    {
        var member = await _dbContext.StaffMembers
            .SingleOrDefaultAsync(member =>
                member.Id == memberId &&
                member.AccountId == accountId);

        if (member is null)
        {
            throw new InvalidOperationException(
                "Staff member was not found.");
        }

        _dbContext.StaffMembers.Remove(member);

        await _dbContext.SaveChangesAsync();
    }
    public async Task<StaffResponse> CreateStaffAsync(
    CreateStaffRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        var memberEmails = request.Members
            .Select(member => member.Email.Trim().ToLowerInvariant())
            .ToList();

        if (memberEmails.Count != memberEmails.Distinct().Count())
        {
            throw new InvalidOperationException(
                "Duplicate staff member emails are not allowed.");
        }

        var existingMemberEmail = await _dbContext.StaffMembers
            .AnyAsync(member => memberEmails.Contains(member.Email));

        if (existingMemberEmail)
        {
            throw new InvalidOperationException(
                "One or more staff member emails already exist.");
        }
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