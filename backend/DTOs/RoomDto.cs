
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateRoomDto
{
    [Required, StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string RoomNumber { get; set; } = string.Empty;

    [Range(1, 30)]
    public int Capacity { get; set; } = 2;
    [Range(1, 30)]
    public int Floor { get; set; } = 1;

    public List<string> Gallery { get; set; } = new();

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Price { get; set; }

    [Required]
    public string Status { get; set; } = "Available";

    [Required]
    public string Type { get; set; } = "single";

    [StringLength(1000)]
    public string? Description { get; set; }
}

public class UpdateRoomDto : CreateRoomDto
{
}
