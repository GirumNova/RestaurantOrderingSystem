using Microsoft.EntityFrameworkCore;

namespace RestaurantOrdering.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}