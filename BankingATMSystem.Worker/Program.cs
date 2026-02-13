using BankingATMSystem.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis;

internal class Program
{
    private static void Main(string[] args)
    {
        // Không cần class, không cần namespace, viết code khởi tạo trực tiếp ở đây
        var builder = Host.CreateApplicationBuilder(args);

        // Đăng ký HostedService (Worker của bạn)
        builder.Services.AddHostedService<Worker>();

        // Đăng ký thêm Infrastructure/Application nếu cần xử lý DB
        // builder.Services.AddInfrastructureServices(builder.Configuration); 

        var host = builder.Build();
        host.Run();
    }
}