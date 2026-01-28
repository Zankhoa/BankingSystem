using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Common.Middleware;
using BankingATMSystem.Application.Common.Service;
using BankingATMSystem.Application.Features.Withdraw;
using BankingATMSystem.Infrastructure.Persistence;
using BankingATMSystem.Infrastructure.Security;
using BankingATMSystem.Infrastructure.Service;
using BankingATMSystem.WebAPI.Middlewares;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// 1. Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("BankingATMSystem.Infrastructure")
    ));
// Đăng ký Redis Cache
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect("localhost:6379, abortConnect = false"));

// 2. Đăng ký Interface → Implementation (CHUẨN)
builder.Services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
builder.Services.AddScoped<IPinHash, PinHash>();
builder.Services.AddScoped<IIdempotencyService, IdempotencyService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddSingleton<RsaService>(); // Bắt buộc Singleton
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(IdempotencyBehavior<,>));
// 3. Đăng ký MediatR (nên trỏ tới Handler)
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(WithdrawHandler).Assembly)
);
builder.Services.AddMediatR(cfg => 
cfg.RegisterServicesFromAssembly(typeof(BankingATMSystem.Application.Features.Auth.LoginCommand).Assembly));

//add fulvalidation
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
//4. Dịch vụ CORS
builder.Services.AddCors(policy =>
{
    policy.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173") // Cho phép tất cả (React chạy port nào cũng được)
                   .AllowAnyMethod() // GET, POST, PUT...
                   .AllowAnyHeader()
                   .AllowCredentials();
});
});
// 2. CẤU HÌNH JWT ĐỂ ĐỌC TỪ COOKIE
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        //cau hinh ktra validatin
        //day la may soi de biet token la that hay gia
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            //1 ktra nguoi phat hanh (Issuer)
            //co dung la server phat hanh khong
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JwtSetting:Issuer"],
            //2 kiem tra doi tuong thu huong 
            //token nay co dung la danh cho fe digibank khong
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JwtSetting:Audience"],
            //3 kiem tra thoi gian
            //token da het han chua
            ValidateLifetime = true,
            //4 dung chu ky signingkey 
            //dung cai secretKey de soi chu ky
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSetting:Secret"])),
            ClockSkew = TimeSpan.Zero
        };

        //cau hinh lay token
        //day la cho day donet biet lay token tu cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                //mac dinh .net chi tim token o header:authorization: bear...
                //nhung ta dang dung httpOnly cookie, nen header se rong

                ////vao cookie lay cai accessToken
                var tokenFromCookie = context.Request.Cookies["accessToken"];

                //neu tim thay thi gán token vao context
                if (!string.IsNullOrEmpty(tokenFromCookie))
                {
                    context.Token = tokenFromCookie;
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                // ĐẶT BREAKPOINT (F9) TẠI DÒNG DƯỚI 
                var error = context.Exception.Message;
                Console.WriteLine("--> LỖI AUTH: " + error);
                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors("AllowReactApp");

app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<SignatureValid>();

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
