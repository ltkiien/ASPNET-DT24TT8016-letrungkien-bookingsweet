
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Room
{
    public int Id { get; set; }

    [Required]
    public int HotelId { get; set; }

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string RoomNumber { get; set; } = string.Empty;

    [Range(1, 30)]
    public int Capacity { get; set; } = 2;

    [Column(TypeName = "decimal(18,2)")]
    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Price { get; set; }

    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "Available";

    [StringLength(1000)]
    public string? Description { get; set; }

    public Hotel Hotel { get; set; } = null!;
}
