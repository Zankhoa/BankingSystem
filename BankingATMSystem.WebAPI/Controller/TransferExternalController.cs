using BankingATMSystem.Application.Features.Transfer;
using BankingATMSystem.Application.Features.TransferExternal;
using BankingATMSystem.Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BankingATMSystem.WebAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransferExternalController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly RsaService _rsaService;
        public TransferExternalController(IMediator mediator, RsaService rsaService)
        {
            _mediator = mediator;
            _rsaService = rsaService;
        }

        [HttpPost("transfer-external")]
        public async Task<IActionResult> TransferExternal([FromBody] TransferExternalRequest request)
        {
            var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId)) return Unauthorized();
            var pinHased = _rsaService.Decrypt(request.Pin);
            var command = new TransferExternalCommand
            {
                requestId = request.RequestId,
                SenderId = senderId,
                Pin = pinHased,
                Amount = request.AmountMoney,
                ToAccountNumber = request.ReceiverAccountNumber,
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPost("checkPin")]
        public async Task<IActionResult> checkPin()
        {
            try
            {
                var senderId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                var command = new CheckPinCommand
                {
                    userId = senderId
                };
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("key-public")]
        public async Task<IActionResult> GetPublicKey()
        {
            return Ok(new { publicKey = _rsaService.GetPublicKey() });
        }
    }
    public class TransferExternalRequest
    {
        public string ReceiverAccountNumber { get; set; }
        public decimal AmountMoney {  get; set; }
        public string Pin { get; set; }
        public string RequestId { get; set; }

    }
}
