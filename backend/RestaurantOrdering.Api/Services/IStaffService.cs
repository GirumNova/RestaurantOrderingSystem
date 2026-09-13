using RestaurantOrdering.Api.DTOs.Authentication;
using RestaurantOrdering.Api.DTOs.Staff;

namespace RestaurantOrdering.Api.Services;

public interface IStaffService
{
    // Create
    Task<StaffResponse> CreateStaffAsync(
        CreateStaffRequest request);

    // Get
    Task<List<StaffResponse>> GetAllStaffAsync();

    Task<StaffResponse> GetStaffByIdAsync(
        int accountId);

    // Update Staff account
    Task<StaffResponse> UpdateStaffAsync(
        int accountId,
        UpdateStaffRequest request);

    // Activate / deactivate Staff account
    Task UpdateStaffStatusAsync(
        int accountId,
        bool isActive);

    // Staff members
    Task<StaffMemberResponse> AddStaffMemberAsync(
        int accountId,
        CreateStaffMemberRequest request);

    Task<StaffMemberResponse> UpdateStaffMemberAsync(
        int accountId,
        int memberId,
        UpdateStaffMemberRequest request);

    Task UpdateStaffMemberStatusAsync(
        int accountId,
        int memberId,
        bool isActive);

    Task DeleteStaffMemberAsync(
        int accountId,
        int memberId);

    // Password change
    Task RequestPasswordChangeAsync(
        StaffPasswordChangeRequest request);

    Task<List<PasswordChangeRequestResponse>>
        GetPendingPasswordChangeRequestsAsync();

    Task ChangeStaffPasswordAsync(
        int requestId,
        ChangeStaffPasswordRequest request);
}