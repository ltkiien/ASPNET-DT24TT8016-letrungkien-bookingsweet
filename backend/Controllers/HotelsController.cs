using backend.Data;
using backend.DTOs.Hotels;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly BookingDbContext _context;

    public HotelsController(BookingDbContext context)
    {
        _context = context;
    }

    private static readonly string[] AllowedStatuses =
    {
        "active",
        "inactive",
        "closed"
        };

    private static HotelResponseDto MapHotel(Hotel hotel)
    {
        List<string> gallery = new();

        if (!string.IsNullOrWhiteSpace(hotel.Gallery))
        {
            try
            {
                gallery =
                    System.Text.Json.JsonSerializer
                        .Deserialize<List<string>>(hotel.Gallery)
                    ?? new List<string>();
            }
            catch (System.Text.Json.JsonException)
            {
                // Dữ liệu cũ không phải JSON hợp lệ
                gallery = new List<string>();
            }
        }

        return new HotelResponseDto
        {
            Id = hotel.Id,
            Name = hotel.Name,
            Description = hotel.Description,
            Address = hotel.Address,
            City = hotel.City,
            StarRating = hotel.StarRating,
            Price = hotel.Price,
            Latitude = hotel.Latitude,
            Longitude = hotel.Longitude,
            ImageUrl = hotel.ImageUrl,
            Gallery = gallery,
            Phone = hotel.Phone,
            Email = hotel.Email,
            Status = hotel.Status,
            CreatedAt = hotel.CreatedAt
        };
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> UserGetAllHotels()
    {
        var hotels = await _context.Hotels
            .AsNoTracking()
            .Where(h => h.Status == "active")
            .OrderBy(h => h.Name)
            .ToListAsync();

        return Ok(hotels.Select(MapHotel));
    }

    // POST: /api/Hotels
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateHotel(
        [FromBody] CreateHotelDto request)
    {
        // Kiểm tra dữ liệu
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        if (!AllowedStatuses.Contains(request.Status))
            return BadRequest(new { message = "Trạng thái khách sạn không hợp lệ." });

        var hotel = new Hotel
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),

            StarRating = request.StarRating,
            Price = request.Price,
            Gallery = System.Text.Json.JsonSerializer.Serialize(request.Gallery),
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            ImageUrl = request.ImageUrl?.Trim(),
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim(),

            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetHotelById),
            new { id = hotel.Id },
            new
            {
                message = "Thêm khách sạn thành công",
                data = MapHotel(hotel)
            });
    }

    // GET: /api/Hotels/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetHotelById(int id)
    {
        var hotel = await _context.Hotels
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hotel == null)
            return NotFound(new
            {
                message = "Không tìm thấy khách sạn"
            });

        return Ok(MapHotel(hotel));
    }

    // GET: api/Hotels
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllHotels()
    {
        var hotels = await _context.Hotels
            .AsNoTracking()
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return Ok(new
        {
            message = "Lấy danh sách khách sạn thành công",
            data = hotels.Select(MapHotel).ToList()
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateHotel(
    int id,
    [FromBody] UpdateHotelDto request)
    {
        var hotel = await _context.Hotels
            .FirstOrDefaultAsync(h => h.Id == id);

        if (AllowedStatuses.Contains(request.Status) == false)
        {
            return BadRequest(new
            {
                message = "Trạng thái khách sạn không hợp lệ"
            });
        }

        if (hotel == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy khách sạn"
            });
        }

        hotel.Name = request.Name.Trim();
        hotel.Description = request.Description?.Trim();
        hotel.Address = request.Address.Trim();
        hotel.City = request.City.Trim();
        hotel.StarRating = request.StarRating;
        hotel.Price = request.Price;
        hotel.Latitude = request.Latitude;
        hotel.Longitude = request.Longitude;
        hotel.ImageUrl = request.ImageUrl?.Trim();
        hotel.Gallery = System.Text.Json.JsonSerializer.Serialize(request.Gallery);
        hotel.Phone = request.Phone?.Trim();
        hotel.Email = request.Email?.Trim();
        hotel.Status = request.Status;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Cập nhật khách sạn thành công",
            data = MapHotel(hotel)
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteHotel(int id)
    {
        var hasRooms = await _context.Rooms
    .AnyAsync(r => r.HotelId == id);

        if (hasRooms)
        {
            return BadRequest(new
            {
                message = "Không thể xóa khách sạn vì vẫn còn phòng. Vui lòng xử lý các phòng trước."
            });
        }
        var hotel = await _context.Hotels
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hotel == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy khách sạn"
            });
        }

        _context.Hotels.Remove(hotel);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Xóa khách sạn thành công"
        });
    }
}