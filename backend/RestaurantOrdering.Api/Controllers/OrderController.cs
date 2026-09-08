using Microsoft.AspNetCore.Mvc;
using RestaurantOrdering.Api.DTOs.Order;
using RestaurantOrdering.Api.Services;

namespace RestaurantOrdering.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrderRequest request)
    {
        try
        {
            var order = await _orderService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetByOrderNumber),
                new { orderNumber = order.OrderNumber },
                order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{orderNumber}")]
    public async Task<IActionResult> GetByOrderNumber(
        string orderNumber)
    {
        var order =
            await _orderService.GetByOrderNumberAsync(orderNumber);

        if (order == null)
        {
            return NotFound(new
            {
                message = "Order not found."
            });
        }

        return Ok(order);
    }
}