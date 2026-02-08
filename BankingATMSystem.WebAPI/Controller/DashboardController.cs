using BankingATMSystem.Application.Features.Dashboard;
using BankingATMSystem.Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BankingATMSystem.WebAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly RsaService _rsaService;
        public DashboardController(IMediator mediator, RsaService rsaService)
        {
            _mediator = mediator;
            _rsaService = rsaService;
        }
        [HttpPost("data-history")]
        public async Task<IActionResult> GetTransactionHisory([FromBody] GetDataChartRequest request)
        {
            var userAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new HistoryTransactionDashboardCommand
            {
                userAccountId = userAccountId,
                FromDate = request.FromDate,
                ToDate = request.ToDate,
            };
            var result = await _mediator.Send(command);
            return Ok(result);

        }
        [HttpPost("total-money")]
        public async Task<IActionResult> GetTotalMoney([FromBody] GetDataChartRequest request)
        {
            var userAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new GetTotalMoneyCommand
            {
                UserAccountId = userAccountId,
                FromDate = request.FromDate,
                ToDate = request.ToDate,
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("data-chart")]
        public async Task<IActionResult> GetDataChart([FromBody] GetDataChartRequest request)
        {
            var userAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var command = new GetDataMoneyChartCommand
            {
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                userAccountId = userAccountId
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        public class GetDataChartRequest
        {
            public DateTime FromDate { get; set; }
            public DateTime ToDate { get; set; }
        }
        public class TotalMoneyRequest
        {
            public DateTime Date { get; set; }
        }
    }
}
