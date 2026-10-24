using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class BookingDetail
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public int RoomId { get; set; }

    public decimal PricePerNight { get; set; }

    public int NumberOfNights { get; set; }

    public decimal Amount { get; set; }

    public Booking Booking { get; set; } = null!;

    public Room Room { get; set; } = null!;
}