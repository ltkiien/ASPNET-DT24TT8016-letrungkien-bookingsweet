using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Booking
{
    public int Id { get; set; }

    [Required]
    public string BookingCode { get; set; } = string.Empty;

    public int UserId { get; set; }

    public DateTime CheckIn { get; set; }

    public DateTime CheckOut { get; set; }

    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Pending";

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BookingDetail> BookingDetails { get; set; }
        = new List<BookingDetail>();
}