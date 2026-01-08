using BankingATMSystem.Application.Features.Withdraw;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BankingATMSystem.WebAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ATMController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ATMController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("withdraw")]
        public async Task<IActionResult> Withdraw([FromBody] WithdrawCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(new { success = result, message = "Giao dịch thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }
}
