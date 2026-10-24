
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
        "Available",
        "Maintenance",
        "Occupied"
    };
    private static readonly string[] AllowedTypes =
    {
        "single",
        "double",
        "twin",
        "family",
        "suite"
    };

    private static RoomResponseDto MapRoom(Room room)
    {
        List<string> gallery = new();

        if (!string.IsNullOrWhiteSpace(room.Gallery))
        {
            try
            {
                gallery =
                    System.Text.Json.JsonSerializer
                        .Deserialize<List<string>>(room.Gallery)
                    ?? new List<string>();
            }
            catch (System.Text.Json.JsonException)
            {
                // Dữ liệu cũ không phải JSON hợp lệ
                gallery = new List<string>();
            }
        }


        return new RoomResponseDto
        {
            Id = room.Id,
            HotelId = room.HotelId,
            HotelName = room.Hotel.Name,
            Name = room.Name.Trim(),
            RoomNumber = room.RoomNumber.Trim(),
            Capacity = room.Capacity,
            Floor = room.Floor,
            Gallery = gallery,
            Type = room.Type,
            Price = room.Price,
            Status = room.Status,
            Description = room.Description?.Trim()
        };
    }

    [HttpGet("/api/Rooms/public/occupied")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOccupiedRooms()
    {
        var rooms = await _context.Rooms
            .AsNoTracking()
            .Include(r => r.Hotel)
            .Where(r => r.Status.ToLower() == "occupied")
            .ToListAsync();

        return Ok(rooms.Select(r => MapRoom(r)));
    }

    [HttpGet("/api/Rooms/public")]
    [AllowAnonymous]
    public async Task<IActionResult> UserGetAllRooms()
    {
        var rooms = await _context.Rooms
            .AsNoTracking()
            .Include(r => r.Hotel)
            .Where(r =>
                r.Status.ToLower() == "available" &&
                r.Hotel != null &&
                r.Hotel.Status == "active")
            .ToListAsync();

        return Ok(rooms.Select(r => MapRoom(r)));
    }

    [HttpGet("/api/hotels/{hotelId:int}/rooms")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRoomsByHotel(int hotelId)
    {
        var rooms = await _context.Rooms
            .AsNoTracking()
            .Include(r => r.Hotel)
            .Where(r =>
                r.HotelId == hotelId &&
                r.Hotel != null &&
                r.Hotel.Status == "active" &&
                r.Status.ToLower() == "available")
            .ToListAsync();

        return Ok(rooms.Select(r => MapRoom(r)));
    }

    [HttpGet("/api/rooms")]
    public async Task<IActionResult> GetAllRooms(
    CancellationToken cancellationToken)
    {
        var rooms = await _context.Rooms
            .AsNoTracking()
            .Include(r => r.Hotel)
            .ToListAsync(cancellationToken);

        return Ok(rooms.Select(r => MapRoom(r)).ToList());
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
            .Include(r => r.Hotel)
            .Where(r => r.HotelId == hotelId)
            .OrderBy(r => r.RoomNumber)
            .ToListAsync(cancellationToken);

        return Ok(rooms.Select(r => MapRoom(r)).ToList());
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
            MapRoom(await _context.Rooms
            .Include(r => r.Hotel)
            .FirstAsync(r => r.Id == room.Id, cancellationToken))
);
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

        await _context.Entry(room)
            .Reference(r => r.Hotel)
            .LoadAsync(cancellationToken);

        return Ok(new
        {
            message = "Cập nhật phòng thành công.",
            data = MapRoom(room)
        });
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
