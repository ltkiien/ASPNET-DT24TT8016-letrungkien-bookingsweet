using backend.Data;
using backend.DTOs.Hotels;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class HotelService : IHotelService
{
    private readonly BookingDbContext _context;

    public HotelService(BookingDbContext context)
    {
        _context = context;
    }

    // Thêm khách sạn
    public async Task<Hotel> CreateAsync(CreateHotelDto request)
    {
        var hotel = new Hotel
        {
            Name = request.Name.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            StarRating = request.StarRating,
            CreatedAt = DateTime.UtcNow
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        return hotel;
    }

    // Lấy danh sách khách sạn
    public async Task<List<Hotel>> GetAllAsync()
    {
        return await _context.Hotels
            .AsNoTracking()
            .OrderByDescending(h => h.Id)
            .ToListAsync();
    }

    // Lấy chi tiết khách sạn
    public async Task<Hotel?> GetByIdAsync(int id)
    {
        return await _context.Hotels
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    // Cập nhật khách sạn

    public async Task<Hotel?> UpdateAsync(
        int id,
        UpdateHotelDto request)
    {
        var hotel = await _context.Hotels
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hotel == null)
            return null;

        hotel.Name = request.Name.Trim();
        hotel.Address = request.Address.Trim();
        hotel.City = request.City.Trim();
        hotel.Description = request.Description?.Trim();

        hotel.Price = request.Price;
        hotel.StarRating = request.StarRating;

        hotel.Latitude = request.Latitude;
        hotel.Longitude = request.Longitude;

        hotel.ImageUrl = request.ImageUrl?.Trim();
        hotel.Phone = request.Phone?.Trim();
        hotel.Email = request.Email?.Trim();


        await _context.SaveChangesAsync();

        return hotel;
    }


    // Xóa khách sạn
    public async Task<bool> DeleteAsync(int id)
    {
        var hotel = await _context.Hotels
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hotel == null)
            return false;

        _context.Hotels.Remove(hotel);
        await _context.SaveChangesAsync();

        return true;
    }
}