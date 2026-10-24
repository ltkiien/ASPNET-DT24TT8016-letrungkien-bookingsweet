using System.Security.Claims;
using backend.Data;
using backend.DTOs.Bookings;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly BookingDbContext _context;

    public BookingsController(BookingDbContext context)
    {
        _context = context;
    }

    private int? GetCurrentUserId()
    {
        var value =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("userId")
            ?? User.FindFirstValue("id");

        return int.TryParse(value, out var userId)
            ? userId
            : null;
    }

    // POST: api/Bookings
    [HttpPost]
    public async Task<IActionResult> CreateBooking(
        [FromBody] CreateBookingDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId == null || userId <= 0)
        {
            return Unauthorized(new
            {
                message = "Không xác định được tài khoản đăng nhập. Kiểm tra JWT."
            });
        }

        var checkIn = dto.CheckIn.Date;
        var checkOut = dto.CheckOut.Date;

        var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById(
     OperatingSystem.IsWindows()
         ? "SE Asia Standard Time"
         : "Asia/Ho_Chi_Minh"
 );

        var todayInVietnam = TimeZoneInfo
            .ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone)
            .Date;
        if (checkIn < todayInVietnam)
        {
            return BadRequest(new
            {
                message = "Ngày nhận phòng không được ở trong quá khứ.",
                checkIn = checkIn.ToString("yyyy-MM-dd"),
                today = todayInVietnam.ToString("yyyy-MM-dd")
            });
        }

        if (checkOut <= checkIn)
        {
            return BadRequest(new
            {
                message = "Ngày trả phòng phải sau ngày nhận phòng."
            });
        }

        var nights = (checkOut - checkIn).Days;

        var room = await _context.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(
                r => r.Id == dto.RoomId,
                cancellationToken);

        if (room == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy phòng."
            });
        }

        if (!string.Equals(
            room.Status,
            "available",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Phòng hiện không sẵn sàng để đặt."
            });
        }

        // Kiểm tra các booking chưa bị hủy có trùng ngày hay không.
        var isBooked = await _context.BookingDetails
            .AnyAsync(
                d => d.RoomId == dto.RoomId
                    && (d.Booking.Status == "Pending"
                        || d.Booking.Status == "Confirmed")
                    && d.Booking.CheckIn < checkOut
                    && d.Booking.CheckOut > checkIn,
                cancellationToken);

        if (isBooked)
        {
            return Conflict(new
            {
                message = "Phòng đã được đặt trong khoảng thời gian này."
            });
        }

        var totalAmount = room.Price * nights;

        var booking = new Booking
        {
            BookingCode = $"BS{Guid.NewGuid():N}"[..12].ToUpperInvariant(),
            UserId = userId.Value,
            CheckIn = checkIn,
            CheckOut = checkOut,
            TotalAmount = totalAmount,
            Status = "Pending",
            Note = dto.Note?.Trim(),
            CreatedAt = DateTime.UtcNow,
            BookingDetails = new List<BookingDetail>
            {
                new BookingDetail
                {
                    RoomId = room.Id,
                    PricePerNight = room.Price,
                    NumberOfNights = nights,
                    Amount = totalAmount
                }
            }
        };

        await using var transaction =
            await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            _context.Bookings.Add(booking);

            await _context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return StatusCode(StatusCodes.Status201Created, new
        {
            message = "Đặt phòng thành công. Booking đang chờ xác nhận.",
            data = new
            {
                booking.Id,
                booking.BookingCode,
                booking.UserId,
                booking.CheckIn,
                booking.CheckOut,
                booking.TotalAmount,
                booking.Status,
                booking.CreatedAt,
                Room = new
                {
                    room.Id,
                    room.HotelId,
                    room.Name,
                    room.RoomNumber,
                    room.Price
                }
            }
        });
    }

    // GET: api/Bookings/my-bookings
    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings(
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId == null || userId <= 0)
            return Unauthorized(new { message = "JWT không có UserId hợp lệ." });

        var bookings = await _context.Bookings
            .AsNoTracking()
            .Where(b => b.UserId == userId.Value)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.BookingCode,
                b.CheckIn,
                b.CheckOut,
                b.TotalAmount,
                b.Status,
                b.Note,
                b.CreatedAt,
                Rooms = b.BookingDetails.Select(d => new
                {
                    d.RoomId,
                    d.Room.HotelId,
                    HotelName = d.Room.Hotel.Name,
                    d.Room.Name,
                    d.Room.Type,
                    d.Room.RoomNumber,
                    d.PricePerNight,
                    d.NumberOfNights,
                    d.Amount
                }).ToList(),
                User = _context.Users
                .Where(u => u.Id == b.UserId)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email
                })
                .FirstOrDefault(),

            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            message = "Lấy lịch sử đặt phòng thành công.",
            data = bookings
        });
    }

    // GET: api/Bookings/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBooking(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId == null || userId <= 0)
            return Unauthorized();

        var query = _context.Bookings
            .AsNoTracking()
            .Where(b => b.Id == id);

        if (!User.IsInRole("Admin"))
            query = query.Where(b => b.UserId == userId.Value);

        var booking = await query
            .Select(b => new
            {
                b.Id,
                b.BookingCode,
                b.UserId,
                b.CheckIn,
                b.CheckOut,
                b.TotalAmount,
                b.Status,
                b.Note,
                b.CreatedAt,
                Rooms = b.BookingDetails.Select(d => new
                {
                    d.RoomId,
                    d.Room.HotelId,
                    HotelName = d.Room.Hotel.Name,
                    d.Room.Name,
                    d.Room.RoomNumber,
                    d.PricePerNight,
                    d.NumberOfNights,
                    d.Amount
                }).ToList(),
                User = _context.Users
                .Where(u => u.Id == b.UserId)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email
                })
                .FirstOrDefault(),
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (booking == null)
            return NotFound(new { message = "Không tìm thấy booking." });

        return Ok(new { data = booking });
    }

    // PUT: api/Bookings/{id}/cancel
    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> CancelBooking(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId == null || userId <= 0)
            return Unauthorized();

        var isAdmin = User.IsInRole("Admin");

        var booking = await _context.Bookings
            .FirstOrDefaultAsync(
                b => b.Id == id &&
                    (isAdmin || b.UserId == userId.Value),
                cancellationToken);

        if (booking == null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy booking hoặc bạn không có quyền truy cập."
            });
        }

        if (booking.Status != "Pending")
        {
            return BadRequest(new
            {
                message = "Chỉ có thể hủy booking đang chờ xác nhận."
            });
        }

        booking.Status = "Cancelled";

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Hủy booking thành công.",
            data = new
            {
                booking.Id,
                booking.BookingCode,
                booking.Status
            }
        });
    }

    // GET: api/Bookings (Admin)
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllBookings(
        CancellationToken cancellationToken)
    {
        var bookings = await _context.Bookings
            .AsNoTracking()
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.BookingCode,
                b.UserId,
                b.CheckIn,
                b.CheckOut,
                b.TotalAmount,
                b.Status,
                b.CreatedAt,
                Rooms = b.BookingDetails.Select(d => new
                {
                    d.RoomId,
                    HotelName = d.Room.Hotel.Name,
                    d.Room.Name,
                    d.Room.Type,
                    d.Room.RoomNumber,
                    d.PricePerNight,
                    d.NumberOfNights,
                    d.Amount
                }).ToList(),
                User = _context.Users
                .Where(u => u.Id == b.UserId)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email
                })
                .FirstOrDefault(),
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            message = "Lấy danh sách booking thành công.",
            data = bookings
        });
    }
}