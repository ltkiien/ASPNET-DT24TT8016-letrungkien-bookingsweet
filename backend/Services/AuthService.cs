using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs.Auth;
using backend.Models;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly BookingDbContext _context;

    private readonly JwtService _jwtService;

    public AuthService(
        BookingDbContext context,
        JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null || !user.IsActive)
            return null;

        var passwordCorrect =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash
            );

        if (!passwordCorrect)
            return null;

        var token = _jwtService.GenerateToken(
        user.Id,
        user.Email,
        user.FullName,
        user.Role
        );

        return new LoginResponse
        {
            Message = "Đăng nhập thành công",
            User = new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                Token = token
            }
        };
    }
    public async Task<RegisterResponse?> RegisterAsync(
    RegisterRequest request)
    {
        // Kiểm tra email đã tồn tại
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (existingUser != null)
        {
            return null;
        }

        // Hash password
        var passwordHash =
            BCrypt.Net.BCrypt.HashPassword(
                request.Password
            );

        // Tạo user
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHash,
            Phone = request.Phone,
            IsActive = true,
            Role = "User"
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return new RegisterResponse
        {
            Message = "Đăng ký tài khoản thành công",

            User = new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role
            }
        };
    }
}