using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Hotels;

public class UpdateHotelDto
{
    [Required, StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required, StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string City { get; set; } = string.Empty;

    [Range(typeof(decimal), "1", "5")]
    public decimal StarRating { get; set; } = 3.0m;

    [Range(typeof(decimal), "0", "1000000000")]
    public decimal Price { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    public List<string> Gallery { get; set; } = new();

    [StringLength(20)]
    public string? Phone { get; set; }

    [EmailAddress, StringLength(256)]
    public string? Email { get; set; }

    public string Status { get; set; } = "active";
}