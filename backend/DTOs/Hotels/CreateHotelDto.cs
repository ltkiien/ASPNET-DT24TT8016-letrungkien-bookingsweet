using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Hotels;

public class CreateHotelDto
{
    [Required(ErrorMessage = "Tên khách sạn không được để trống")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Địa chỉ không được để trống")]
    [StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Thành phố không được để trống")]
    [StringLength(100)]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Quốc gia không được để trống")]
    [StringLength(100)]
    public string Country { get; set; } = string.Empty;

    [Range(1, 5, ErrorMessage = "Số sao phải từ 1 đến 5")]
    public int StarRating { get; set; } = 3;

    [Range(0, 1000000000,
        ErrorMessage = "Giá khách sạn không hợp lệ")]
    public decimal Price { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(256)]
    public string? Email { get; set; }

    public bool IsActive { get; set; } = true;
}