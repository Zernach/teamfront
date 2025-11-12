using System.Diagnostics;
using MediatR;

namespace SmartScheduler.Logging;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var stopwatch = Stopwatch.StartNew();

        _logger.LogInformation(
            "Handling request {RequestName} | Payload={Payload}",
            requestName,
            LogValueFormatter.ToSafeLogValue(request));

        try
        {
            var response = await next();
            stopwatch.Stop();

            _logger.LogInformation(
                "Handled request {RequestName} in {ElapsedMs} ms | Response={ResponsePayload}",
                requestName,
                stopwatch.Elapsed.TotalMilliseconds,
                LogValueFormatter.ToSafeLogValue(response));

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            _logger.LogError(
                ex,
                "Error handling request {RequestName} after {ElapsedMs} ms | Payload={Payload}",
                requestName,
                stopwatch.Elapsed.TotalMilliseconds,
                LogValueFormatter.ToSafeLogValue(request));

            throw;
        }
    }
}

