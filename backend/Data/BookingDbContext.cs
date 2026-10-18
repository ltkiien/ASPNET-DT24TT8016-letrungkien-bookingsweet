using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class BookingDbContext : DbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Hotel> Hotels { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .ToTable("Users");

        modelBuilder.Entity<User>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();
    }
}