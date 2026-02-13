using BankingATMSystem.Application.Events;
using MassTransit;
using Microsoft.AspNetCore.Mvc;

namespace BankingATMSystem.WebAPI.Controllers;

[ApiController]
[Route("api/webhooks/bank")]
public class BankWebhookController : ControllerBase
{
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<BankWebhookController> _logger;

    public BankWebhookController(IPublishEndpoint publishEndpoint, ILogger<BankWebhookController> logger)
    {
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    [HttpPost("callback")]
    public async Task<IActionResult> HandleCallback([FromBody] BankCallbackPayload payload)
    {
        // 1. Log lại để theo dõi (Senior Style)
        _logger.LogInformation("[Webhook] Nhận callback cho Txn: {TxnId}, Status: {Status}",
            payload.TransactionExtenalId, payload.Status);

        // 2. Đẩy vào RabbitMQ để Consumer xử lý Logic (Cộng tiền/Refund/Update DB)
        // Việc này giúp WebAPI trả về 200 OK ngay lập tức cho ngân hàng ngoài
        await _publishEndpoint.Publish(new ProcessBankCallbackEvent(
            payload.TransactionExtenalId,
            payload.Amount,
            payload.AccountNumber,
            payload.Status,
            payload.Message
        ));

        // 3. Trả về thành công để ngân hàng không gọi lại (Retry) nữa
        return Ok(new { message = "Webhook received and queued for processing" });
    }
}

// Model này phải khớp chính xác với JSON mà MockBank gửi sang
public record BankCallbackPayload(
    string TransactionExtenalId,
    decimal Amount,
    string AccountNumber,
    string Status,
    string Message
);