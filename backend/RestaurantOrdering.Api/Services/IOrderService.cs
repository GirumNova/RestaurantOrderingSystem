using RestaurantOrdering.Api.DTOs.Order;
using RestaurantOrdering.Api.Models.Enums;

namespace RestaurantOrdering.Api.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateAsync(
        CreateOrderRequest request);

    Task<OrderResponse?> GetByOrderNumberAsync(
        string orderNumber);

    Task<OrderResponse?> UpdateStatusAsync(
        string orderNumber,
        OrderStatus status,
        string? rejectionReason = null);

        Task<List<OrderResponse>> GetStaffOrdersAsync();
}