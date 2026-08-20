using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs.Auth;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly BookingDbContext _context;

    public AuthController(BookingDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Email hoặc mật khẩu không đúng"
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                message = "Tài khoản đã bị khóa"
            });
        }

        var passwordCorrect =
            BCrypt.Verify(request.Password, user.PasswordHash);

        if (!passwordCorrect)
        {
            return Unauthorized(new
            {
                message = "Email hoặc mật khẩu không đúng"
            });
        }

        return Ok(new LoginResponse
        {
            Message = "Đăng nhập thành công",

            User = new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role
            }
        });
    }
}