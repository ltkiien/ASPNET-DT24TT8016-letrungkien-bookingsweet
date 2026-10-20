
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

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Price { get; set; }

    [Required]
    public string Status { get; set; } = "Available";

    [StringLength(1000)]
    public string? Description { get; set; }
}

public class UpdateRoomDto : CreateRoomDto
{
}
