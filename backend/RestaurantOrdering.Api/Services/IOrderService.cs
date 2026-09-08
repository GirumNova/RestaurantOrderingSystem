using RestaurantOrdering.Api.DTOs.Order;

namespace RestaurantOrdering.Api.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateAsync(
        CreateOrderRequest request);

    Task<OrderResponse?> GetByOrderNumberAsync(
        string orderNumber);
}