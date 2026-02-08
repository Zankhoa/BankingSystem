using BankingATMSystem.Application.Features.Auth;
using BankingATMSystem.Infrastructure.Security;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text.Json.Serialization;


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
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginPayload payload)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString() ?? "Unknown";
            try
            {
                string realPassword = _rsaService.Decrypt(payload.EncryptedPassword);
                var command = new LoginCommand(payload.username, realPassword, ipAddress);
                var result = await _mediator.Send(command);

                //bao mat set cookie httonly
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, //set false neu chay localhost khong co https
                    SameSite = SameSiteMode.None,
                    Expires = result.RefreshTokenExpiration,
                    IsEssential = true
                };
                Response.Cookies.Append("accessToken", result.accessToken, cookieOptions);
                Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);
                return Ok(new { message = "Login thành công", sessionSecret = result.SignatureSecret});
            }
            catch(Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("info")]
        public async Task<IActionResult> GetUserInfo()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized();
                var command = new GetUserInforCommand(userId);
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return Unauthorized(new { message = ex.Message }); 
            }
        }
        [Authorize]
        [HttpPost("pins")]
        public async Task<IActionResult> CreatePin([FromBody] CreatePinRequest request)
        {
            var userAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var pin = _rsaService.Decrypt(request.HashPin);
            var password = _rsaService.Decrypt(request.HashPassword);
            var command = new RegisterPinCommand
            {
                userAccountId = userAccountId,
                Pin = pin,
                Password = password,
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }


        [HttpPost("refreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken)) return Unauthorized();
                var ipAddress = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString() ?? "Unknown";
                var command = new RefreshTokenCommand(request.refreshToken, ipAddress);
                var result = await _mediator.Send(command);
                if (result == null)
                {
                    // Nếu lỗi (hack, hết hạn...) -> Xóa Cookie để bắt login lại
                    Response.Cookies.Delete("accessToken");
                    Response.Cookies.Delete("refreshToken");
                    return Unauthorized();
                }
                var cookieAccess = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict, 
                    Expires = result.NewAccessTokenExpiry,
                    IsEssential = true
                };
                var cookieRefresh = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = result.NewRefreshTokenExpiry,
                    IsEssential = true
                };
                Response.Cookies.Append("accessToken", result.NewAccessToken, cookieAccess);
                Response.Cookies.Append("refreshToken", result.NewRefreshToken, cookieRefresh);
                return Ok(new {message = "refreshThanh cong"});
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message});
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            //xoa cookie
            Response.Cookies.Delete("accessToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });
            return Ok(new { message = "logut successfull" });
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
                    Phone = payload.Phone,
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

    public class CreatePinRequest
    {
        [JsonPropertyName("PinHash")]
        public string HashPin { get; set; }

        [JsonPropertyName("PasswordHash")]
        public string HashPassword { get; set; }
    }
    public class RegisterPayload
    {
        public string Username { get; set; }
        public string EncryptedPassword { get; set; } // RSA String
        public string Phone { get; set; }
        public string Email { get; set; }
    }
    public record LoginPayload
    {
        public string username { get; set; }
        public string EncryptedPassword { get; set; }
    }
     public class RefreshTokenRequest
    {
        public string refreshToken { get; set; }
    }

}
