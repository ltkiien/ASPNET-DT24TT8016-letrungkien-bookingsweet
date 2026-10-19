using backend.DTOs.Hotels;
using backend.Models;

namespace backend.Services;

public interface IHotelService
{
    Task<Hotel> CreateAsync(CreateHotelDto request);

    Task<List<Hotel>> GetAllAsync();

    Task<Hotel?> GetByIdAsync(int id);

    Task<Hotel?> UpdateAsync(int id, UpdateHotelDto request);

    Task<bool> DeleteAsync(int id);
}