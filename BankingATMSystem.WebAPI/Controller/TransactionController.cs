using BankingATMSystem.Application.Features.Auth;
using BankingATMSystem.Application.Features.Transfer;
using BankingATMSystem.Application.Features.UserInfo;
using BankingATMSystem.Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Cryptography.X509Certificates;

namespace BankingATMSystem.WebAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly RsaService _rsaService;
        public TransactionController(IMediator mediator, RsaService rsaService)
        {
            _mediator = mediator;
            _rsaService = rsaService;
        }
        [HttpPost("transfer")]
       public async Task<IActionResult> Transfer([FromBody] TransferCommand command)
        {
            try
            {
                //tu dong lay id cua nguoi gui tu token 
                var senderId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (string.IsNullOrEmpty(senderId)) return Unauthorized();
                command.SenderId = senderId;
                var result = await _mediator.Send(command);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("getInfo")]
        public async Task<IActionResult> getInfor([FromBody] GetInfoResponse acc)
        {
            try
            {
                var command = new GetUserCommand(acc.accountNumber);
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message =ex.Message });
            }
        }

        [HttpPost("getPublicKey")]
        public async Task<IActionResult> getPublicKey()
        {
            return Ok(new { publicKey = _rsaService.GetPublicKey() });
        }
    }
    public class GetInfoResponse
    {
        public string accountNumber { get; set; }
    }
}
