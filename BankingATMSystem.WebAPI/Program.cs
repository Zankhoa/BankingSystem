using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Features.Withdraw;
using BankingATMSystem.Infrastructure.Persistence;
using BankingATMSystem.Infrastructure.Security;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// 1. Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("BankingATMSystem.Infrastructure")
    ));
// Đăng ký Redis Cache
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect("localhost:6379"));

// 2. Đăng ký Interface → Implementation (CHUẨN)
builder.Services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddSingleton<RsaService>(); // Bắt buộc Singleton
// 3. Đăng ký MediatR (nên trỏ tới Handler)
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(WithdrawHandler).Assembly)
);
builder.Services.AddMediatR(cfg => 
cfg.RegisterServicesFromAssembly(typeof(BankingATMSystem.Application.Features.Auth.LoginCommand).Assembly));

//add fulvalidation
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
//4. Dịch vụ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173") // Cho phép tất cả (React chạy port nào cũng được)
                   .AllowAnyMethod() // GET, POST, PUT...
                   .AllowAnyHeader()
                   .AllowCredentials();
});
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors("AllowAll");

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();
try
{
    app.MapControllers();
}
catch (ReflectionTypeLoadException ex)
{
    foreach (var e in ex.LoaderExceptions!)
    {
        Console.WriteLine("❌ " + e.Message);
    }
    throw;
}
app.Run();
