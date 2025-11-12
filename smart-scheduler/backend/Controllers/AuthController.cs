using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SmartScheduler.Commands;
using SmartScheduler.DTOs;
using MediatR;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public ActionResult Register([FromBody] RegisterRequest request)
    {
        // Registration is now handled by AWS Cognito on the frontend
        return StatusCode(410, new {
            message = "Registration is now handled by AWS Cognito. Please use the frontend registration flow."
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public ActionResult Login([FromBody] LoginRequest request)
    {
        // Login is now handled by AWS Cognito on the frontend
        return StatusCode(410, new {
            message = "Login is now handled by AWS Cognito. Please use the frontend login flow."
        });
    }

    [HttpGet("me")]
    [AllowAnonymous] // Allow public access - no authentication required
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public ActionResult GetCurrentUser()
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        _logger.LogInformation("[RequestId: {RequestId}] GetCurrentUser called, Authenticated={Authenticated}",
            requestId, User?.Identity?.IsAuthenticated ?? false);
        
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value 
                ?? User.Identity?.Name;
            var email = User.FindFirst(ClaimTypes.Email)?.Value 
                ?? User.FindFirst("email")?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value 
                ?? User.FindFirst("cognito:username")?.Value
                ?? (email != null ? email.Split('@')[0] : null);

            _logger.LogInformation("[RequestId: {RequestId}] GetCurrentUser completed, userId={UserId}, email={Email}",
                requestId, userId, email);

            return Ok(new
            {
                id = userId,
                email = email,
                username = username
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RequestId: {RequestId}] Error in GetCurrentUser", requestId);
            return StatusCode(500, new { message = "An error occurred while getting user info", error = ex.Message });
        }
    }
}

