public class RoomResponseDto
{
    public int Id { get; set; }

    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public string RoomNumber { get; set; } = string.Empty;

    public int Capacity { get; set; } = 2;
    public int Floor { get; set; } = 1;

    public List<string> Gallery { get; set; } = new();

    public decimal Price { get; set; }

    public string Status { get; set; } = "Available";

    public string Type { get; set; } = "single";

    public string? Description { get; set; }
}
