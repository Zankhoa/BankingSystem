using BankingATMSystem.Application.Features.Auth;
using BankingATMSystem.Infrastructure.Security;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;


namespace BankingATMSystem.WebAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly RsaService _rsaService;

        public AuthenticationController(IMediator mediator, RsaService rsaService)
        {
            _mediator = mediator;
            _rsaService = rsaService;
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
        [HttpGet("public-key")]
        public IActionResult GetPublicKey() => Ok(new { publicKey = _rsaService.GetPublicKey() });

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterPayload payload)
        {
            try
            {
                // Giải mã Pass từ Frontend gửi lên
                string realPassword = _rsaService.Decrypt(payload.EncryptedPassword);

                var command = new RegisterCommand
                {
                    Username = payload.Username,
                    Password = realPassword, // Đưa pass thật vào xử lý
                    Email = payload.Email,
                    PhoneNumber = payload.Phone,
                };

                var result = await _mediator.Send(command);
                return Ok(new { message = result });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors.Select(e => e.ErrorMessage) });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

    }
    public class RegisterPayload
    {
        public string Username { get; set; }
        public string EncryptedPassword { get; set; } // RSA String
        public string Phone { get; set; }
        public string Email { get; set; }
    }
    public record LoginRequestDTO(string Username, string Password);
}
