using BankingATMSystem.Application.Features.Auth;
using BankingATMSystem.Application.Features.Dashboard;
using BankingATMSystem.Application.Features.HistoryTransaction;
using BankingATMSystem.Application.Features.Transfer;
using BankingATMSystem.Application.Features.UserInfo;
using BankingATMSystem.Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
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
        public async Task<IActionResult> Transfer([FromBody] TransferRequest request)
        {
            try
            {
                //tu dong lay id cua nguoi gui tu token 
                var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(senderId)) return Unauthorized();
                var pinHased = _rsaService.Decrypt(request.Pin);
                var command = new TransferCommand
                {
                    requestId = request.RequestId,
                    SenderId = senderId,
                    Pin = pinHased,
                    AmountMoney = request.AmountMoney,
                    Description = request.Description,
                    ReceiverAccountNumber = request.ReceiverAccountNumber,
                    Types = request.Types
                };
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
                return BadRequest(new { message = ex.Message });
            }
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

        [HttpPost("register-pin")]
        public async Task<IActionResult> registerPin([FromBody] RegisterPinRequest request)
        {
            var realPin = _rsaService.Decrypt(request.PinHash);
            var userAccountId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userAccountId)) return Unauthorized();
            var command = new GetPinCommand(realPin, userAccountId);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("key-public")]
        public async Task<IActionResult> GetPublicKey()
        {
            return Ok(new { publicKey = _rsaService.GetPublicKey() });
        }

        [HttpPost("history")]
        public async Task<IActionResult> GetTransactionHisory([FromBody] TransactionHisoryRequest request)
        {
            var userAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new TransactionHistoryCommand
            {
                userAccountId = userAccountId,
                SearchData = request.SearchData,
                Page = request.page,
                PageSize = request.pageSize,
                FromDate = request.FromDate,
                ToDate = request.ToDate,
            };
            var result = await _mediator.Send(command);
            return Ok(result);

        }

    }
    public class TransactionHisoryRequest
    {
        public string SearchData { get; set; }
        public int page { get; set; }
        public int pageSize { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }

    public class GetInfoResponse
    {
        public string accountNumber { get; set; }
    }

    public class RegisterPinRequest
    {
        public string PinHash { get; set; }
    }
    public class TransferRequest
    {
        public string RequestId { get; set; }
        public decimal AmountMoney { get; set; }
        public string Types { get; set; }
        public string Description { get; set; }
        public string ReceiverAccountNumber { get; set; }
        public string Pin { get; set; }
    }
}

