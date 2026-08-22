namespace backend.DTOs.Auth;

public class RegisterResponse
{
    public string Message { get; set; } = string.Empty;

    public UserResponse? User { get; set; }
}