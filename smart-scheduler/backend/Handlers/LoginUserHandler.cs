using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.Data;
using SmartScheduler.DTOs;
using SmartScheduler.Services;

namespace SmartScheduler.Handlers;

public class LoginUserHandler : IRequestHandler<LoginUserCommand, AuthResponse>
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public LoginUserHandler(ApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        // Support both username and email login
        var user = await _context.Users
            .FirstOrDefaultAsync(u => 
                u.Username == request.Username || 
                (!string.IsNullOrEmpty(request.Email) && u.Email == request.Email), 
                cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Username);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = _jwtService.GetAccessTokenExpiration(),
            RefreshTokenExpiresAt = _jwtService.GetRefreshTokenExpiration(),
            User = new UserInfo
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = "user" // Default role, can be extended later
            }
        };
    }
}

