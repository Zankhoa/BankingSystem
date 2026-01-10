using BankingATMSystem.Application.Features.Auth;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace BankingATMSystem.WebAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IMediator _mediator;
        
        public AuthenticationController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString() ?? "Unknown";
            try
            {
                var command = new LoginCommand(request.Username, request.Password, ipAddress);
                var result = await _mediator.Send(command);

                //bao mat set cookie httonly
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, //set false neu chay localhost khong co https
                    SameSite = SameSiteMode.Strict,
                    Expires = result.RefreshTokenExpiration
                };
                Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);
                return Ok(new { AccessToken = result.accessToken });
            }
            catch(Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
    public record LoginRequestDTO(string Username, string Password);
}
