namespace SmartScheduler.Services;

public interface IJwtService
{
    string GenerateAccessToken(Guid userId, string username);
    string GenerateRefreshToken();
    DateTime GetAccessTokenExpiration();
    DateTime GetRefreshTokenExpiration();
}

