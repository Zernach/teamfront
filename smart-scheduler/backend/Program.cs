using Microsoft.EntityFrameworkCore;
using SmartScheduler.Data;
using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure port binding for Elastic Beanstalk
// EB provides PORT environment variable, fallback to 5000 for local development
// Only set UseUrls if ASPNETCORE_URLS is not already set
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add services to the container
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=smartscheduler_dev;Username=dev_user;Password=dev_password;Include Error Detail=true";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Add FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Note: HTTPS redirection disabled for Elastic Beanstalk (handled by load balancer)
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => "OK");

// Root endpoint
app.MapGet("/", () => "Hello World from Smart Scheduler Backend!");

app.Run();
