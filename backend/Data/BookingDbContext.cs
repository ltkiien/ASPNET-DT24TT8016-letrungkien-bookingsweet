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
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingDetail> BookingDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .ToTable("Users");

        modelBuilder.Entity<User>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Hotel>()
            .HasMany(h => h.Rooms)
            .WithOne(r => r.Hotel)
            .HasForeignKey(r => r.HotelId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.BookingCode)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .Property(b => b.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<BookingDetail>()
            .Property(b => b.PricePerNight)
            .HasPrecision(18, 2);

        modelBuilder.Entity<BookingDetail>()
            .Property(b => b.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Booking>()
            .HasMany(b => b.BookingDetails)
            .WithOne(d => d.Booking)
            .HasForeignKey(d => d.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BookingDetail>()
            .HasOne(d => d.Room)
            .WithMany()
            .HasForeignKey(d => d.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}