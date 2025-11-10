using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.Data;
using SmartScheduler.DTOs;
using SmartScheduler.Models;

namespace SmartScheduler.Handlers;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, RegisterResponse>
{
    private readonly ApplicationDbContext _context;

    public RegisterUserHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RegisterResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // Generate username from email if not provided
        var username = string.IsNullOrWhiteSpace(request.Username) 
            ? request.Email.Split('@')[0] // Use part before @ as username
            : request.Username;

        // Ensure username is unique - if generated username exists, append numbers
        var baseUsername = username;
        var counter = 1;
        while (await _context.Users.AnyAsync(u => u.Username == username, cancellationToken))
        {
            username = $"{baseUsername}{counter}";
            counter++;
        }

        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = request.Email,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return new RegisterResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            CreatedAt = user.CreatedAt
        };
    }
}

