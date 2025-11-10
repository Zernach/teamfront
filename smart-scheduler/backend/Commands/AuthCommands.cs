using MediatR;
using SmartScheduler.DTOs;

namespace SmartScheduler.Commands;

public class RegisterUserCommand : IRequest<RegisterResponse>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginUserCommand : IRequest<AuthResponse>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty; // Support email-based login
    public string Password { get; set; } = string.Empty;
}

