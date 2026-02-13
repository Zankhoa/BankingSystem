using BankingATMSystem.Application.Events;
using MassTransit;
using MockBankingExternal.Worker; // Namespace chứa Consumer giả lập
using static MassTransit.MessageHeaders;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddMassTransit(x =>
{
    // 1. Đăng ký Consumer của MockBank
    x.AddConsumer<TransferInitiatedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h => {
            h.Username("guest");
            h.Password("guest");
        });

        // 2. MockBank lắng nghe ở một Queue riêng
        cfg.ReceiveEndpoint("external-bank-mock-queue", e =>
        {
            e.ConfigureConsumer<TransferInitiatedConsumer>(context);
        });
    });
});

var host = builder.Build();
host.Run();