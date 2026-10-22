
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/hotels/{hotelId:int}/rooms")]
[Authorize(Roles = "Admin")]
public class RoomsController : ControllerBase
{
    private readonly BookingDbContext _context;

    public RoomsController(BookingDbContext context)
    {
        _context = context;
    }

    private static readonly string[] AllowedStatuses =
    {
        "available",
        "maintenance",
        "occupied"
    };
    private static readonly string[] AllowedTypes =
    {
        "single",
        "double",
        "twin",
        "family",
        "suite"
    };

    [HttpGet("/api/rooms")]
    public async Task<IActionResult> GetAllRooms()
    {
        var rooms = await _context.Rooms
            .Include(r => r.Hotel)
            .Select(r => new
            {
                r.Id,
                r.HotelId,
                HotelName = r.Hotel.Name,
                r.Name,
                r.RoomNumber,
                r.Capacity,
                r.Floor,
                r.Gallery,
                r.Type,
                r.Price,
                r.Status,
                r.Description
            })
            .ToListAsync();

        return Ok(rooms);
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms(
        int hotelId,
        CancellationToken cancellationToken)
    {
        var hotelExists = await _context.Hotels
            .AnyAsync(h => h.Id == hotelId, cancellationToken);

        if (!hotelExists)
            return NotFound(new { message = "Không tìm thấy khách sạn." });

        var rooms = await _context.Rooms
            .AsNoTracking()
            .Where(r => r.HotelId == hotelId)
            .OrderBy(r => r.RoomNumber)
            .Select(r => new
            {
                r.Id,
                r.HotelId,
                r.Name,
                r.RoomNumber,
                r.Capacity,
                r.Floor,
                r.Gallery,
                r.Type,
                r.Price,
                r.Status,
                r.Description
            })
            .ToListAsync(cancellationToken);

        return Ok(rooms);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetRoom(
        int hotelId,
        int id,
        CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .AsNoTracking()
            .Where(r => r.HotelId == hotelId && r.Id == id)
            .Select(r => new
            {
                r.Id,
                r.HotelId,
                r.Name,
                r.RoomNumber,
                r.Capacity,
                r.Floor,
                r.Gallery,
                r.Type,
                r.Price,
                r.Status,
                r.Description
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (room == null)
            return NotFound(new { message = "Không tìm thấy phòng." });

        return Ok(room);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoom(
        int hotelId,
        CreateRoomDto dto,
        CancellationToken cancellationToken)
    {
        if (!AllowedStatuses.Contains(dto.Status))
            return BadRequest(new { message = "Trạng thái phòng không hợp lệ." });

        if (!AllowedTypes.Contains(dto.Type))
            return BadRequest(new { message = "Loại phòng không hợp lệ." });

        var hotelExists = await _context.Hotels
            .AnyAsync(h => h.Id == hotelId, cancellationToken);

        if (!hotelExists)
            return NotFound(new { message = "Không tìm thấy khách sạn." });

        var roomNumber = dto.RoomNumber.Trim();

        var duplicated = await _context.Rooms.AnyAsync(
            r => r.HotelId == hotelId &&
                 r.RoomNumber == roomNumber,
            cancellationToken);

        if (duplicated)
            return Conflict(new { message = "Mã phòng đã tồn tại trong khách sạn." });

        var room = new Room
        {
            HotelId = hotelId,
            Name = dto.Name.Trim(),
            RoomNumber = roomNumber,
            Capacity = dto.Capacity,
            Floor = dto.Floor,
            Type = dto.Type,
            Price = dto.Price,
            Status = dto.Status,
            Description = dto.Description?.Trim(),
            Gallery = System.Text.Json.JsonSerializer.Serialize(dto.Gallery)
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(GetRoom),
            new { hotelId, id = room.Id },
            room);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRoom(
        int hotelId,
        int id,
        UpdateRoomDto dto,
        CancellationToken cancellationToken)
    {
        if (!AllowedStatuses.Contains(dto.Status))
            return BadRequest(new { message = "Trạng thái phòng không hợp lệ." });

        if (!AllowedTypes.Contains(dto.Type))
            return BadRequest(new { message = "Loại phòng không hợp lệ." });

        var room = await _context.Rooms.FirstOrDefaultAsync(
            r => r.HotelId == hotelId && r.Id == id,
            cancellationToken);

        if (room == null)
            return NotFound(new { message = "Không tìm thấy phòng." });

        var roomNumber = dto.RoomNumber.Trim();

        var duplicated = await _context.Rooms.AnyAsync(
            r => r.HotelId == hotelId &&
                 r.RoomNumber == roomNumber &&
                 r.Id != id,
            cancellationToken);

        if (duplicated)
            return Conflict(new { message = "Mã phòng đã được sử dụng." });

        room.Name = dto.Name.Trim();
        room.RoomNumber = roomNumber;
        room.Capacity = dto.Capacity;
        room.Floor = dto.Floor;
        room.Type = dto.Type;
        room.Price = dto.Price;
        room.Status = dto.Status;
        room.Description = dto.Description?.Trim();
        room.Gallery = System.Text.Json.JsonSerializer.Serialize(dto.Gallery);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Cập nhật phòng thành công.", room });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteRoom(
        int hotelId,
        int id,
        CancellationToken cancellationToken)
    {
        var room = await _context.Rooms.FirstOrDefaultAsync(
            r => r.HotelId == hotelId && r.Id == id,
            cancellationToken);

        if (room == null)
            return NotFound(new { message = "Không tìm thấy phòng." });

        // Không xóa phòng đã được tham chiếu bởi lịch sử đặt phòng.
        // Thay BookingDetails bằng tên DbSet thực tế trong dự án.
        // var hasBookings = await _context.BookingDetails.AnyAsync(
        //     b => b.RoomId == id,
        //     cancellationToken);

        // if (hasBookings)
        // {
        //     return Conflict(new
        //     {
        //         message = "Phòng đã có lịch sử đặt phòng. Hãy chuyển trạng thái sang ngừng kinh doanh."
        //     });
        // }

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Xóa phòng thành công." });
    }
}
