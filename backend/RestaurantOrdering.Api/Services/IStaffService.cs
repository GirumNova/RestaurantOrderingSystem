using RestaurantOrdering.Api.DTOs.Authentication;
using RestaurantOrdering.Api.DTOs.Staff;

namespace RestaurantOrdering.Api.Services;

public interface IStaffService
{
    Task<StaffResponse> CreateStaffAsync(
        CreateStaffRequest request);

    Task RequestPasswordChangeAsync(
        StaffPasswordChangeRequest request);

    Task<List<PasswordChangeRequestResponse>>
        GetPendingPasswordChangeRequestsAsync();

    Task ChangeStaffPasswordAsync(
        int requestId,
        ChangeStaffPasswordRequest request);
}