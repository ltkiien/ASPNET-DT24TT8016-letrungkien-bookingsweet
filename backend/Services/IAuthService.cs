using backend.DTOs.Auth;

namespace backend.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<RegisterResponse?> RegisterAsync(RegisterRequest request);
    Task<object?> GetMeAsync(int userId);
}