namespace BankingATMSystem.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker ZanKhoa đang chạy lúc: {time}", DateTimeOffset.Now);
            await Task.Delay(10000, stoppingToken); // Chạy vòng lặp mỗi 10 giây
        }
    }
}