using BankingATMSystem.Application.Events;
using BankingATMSystem.Application.Features.TransferExternal;
using MassTransit;
using MediatR;



namespace BankingATMSystem.Worker
{
    public class ProcessBankCallbackConsumer : IConsumer<ProcessBankCallbackEvent>
    {
        private readonly IMediator _mediator;
        private readonly ILogger<ProcessBankCallbackConsumer> _logger;

        public ProcessBankCallbackConsumer(IMediator mediator, ILogger<ProcessBankCallbackConsumer> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<ProcessBankCallbackEvent> context)
        {
            var data = context.Message;
            try
            {
                var command = new UpdateTransactionExternalResultCommand
                {
                    TransactionExternalId = data.TransactionExternalId,
                    Message = data.Message,
                    Status = data.status,
                    FromAccountNumber = data.FromAccountNumber,
                    Amount = data.Amount,
                };

                await _mediator.Send(command);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý Callback cho giao dịch {Id}", data.TransactionExternalId);
                throw; // Quăng lỗi để RabbitMQ thực hiện Retry Policy
            }
        }
    }
}
