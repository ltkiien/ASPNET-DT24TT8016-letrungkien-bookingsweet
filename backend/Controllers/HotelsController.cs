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

    // POST: /api/Hotels
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateHotel(
        [FromBody] CreateHotelDto request)
    {
        // Kiểm tra dữ liệu
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var hotel = new Hotel
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),

            StarRating = request.StarRating,
            Price = request.Price,

            Latitude = request.Latitude,
            Longitude = request.Longitude,
            ImageUrl = request.ImageUrl?.Trim(),
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim(),

            IsActive = request.IsActive,
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
                data = hotel
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

        return Ok(hotel);
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
            data = hotels
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
        hotel.Phone = request.Phone?.Trim();
        hotel.Email = request.Email?.Trim();
        hotel.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Cập nhật khách sạn thành công",
            data = hotel
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteHotel(int id)
    {
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