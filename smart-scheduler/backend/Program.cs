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

var app = builder.Build();

// Configure the HTTP request pipeline
// Note: HTTPS redirection disabled for Elastic Beanstalk (handled by load balancer)
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => "OK");

// Root endpoint
app.MapGet("/", () => "Hello World from Smart Scheduler Backend!");

app.Run();
