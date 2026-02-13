using BankingATMSystem.Application.Events;
using MassTransit;

public class TransferInitiatedConsumer : IConsumer<TransferInitiatedEvent>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public TransferInitiatedConsumer(IPublishEndpoint publishEndpoint) => _publishEndpoint = publishEndpoint;

    public async Task Consume(ConsumeContext<TransferInitiatedEvent> context)
    {
        var msg = context.Message;
        Console.WriteLine($"[MockBank] Đang xử lý giao dịch: {msg.TransactionExternalId} cho STK: {msg.ToAccountNumber}");

        await Task.Delay(2000); // Giả lập độ trễ mạng

        // 80% thành công, 20% thất bại
        bool isSuccess = new Random().Next(1, 100) > 20;

        if (isSuccess)
        {
            await _publishEndpoint.Publish(new TransferSucesssEvent(msg.FromAccountId, "Success"));
            Console.WriteLine($"[MockBank] Giao dịch {msg.FromAccountId} THÀNH CÔNG.");
        }
        else
        {
            await _publishEndpoint.Publish(new TransferFailedEvent(msg.FromAccountId, msg.Amount, "Failed"));
            Console.WriteLine($"[MockBank] Giao dịch {msg.FromAccountId} THẤT BẠI.");
        }
    }
}