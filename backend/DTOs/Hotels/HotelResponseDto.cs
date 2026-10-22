namespace backend.DTOs.Hotels;

public class HotelResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal? StarRating { get; set; }
    public decimal? Price { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public List<string> Gallery { get; set; } = new();
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; }
}