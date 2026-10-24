using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Hotels")]
public class Hotel
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Country { get; set; } = string.Empty;

    [Range(1, 5)]
    public decimal StarRating { get; set; } = 3;
    // public ICollection<Room> Rooms { get; set; } = new List<Room>();

    [Column(TypeName = "decimal(18,2)")]
    [Range(0, 1000000000)]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(10,7)")]
    public decimal? Latitude { get; set; }

    [Column(TypeName = "decimal(10,7)")]
    public decimal? Longitude { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(2000)]
    public string? Gallery { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [EmailAddress]
    [StringLength(256)]
    public string? Email { get; set; }

    public string Status { get; set; } = "active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Room> Rooms { get; set; }
    = new List<Room>();
}