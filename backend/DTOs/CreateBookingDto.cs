using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Bookings;

public class CreateBookingDto
{
    [Range(1, int.MaxValue)]
    public int RoomId { get; set; }

    public DateTime CheckIn { get; set; }

    public DateTime CheckOut { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }
}