using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace SmartScheduler.Logging;

public class ApiLoggingFilter : IAsyncActionFilter
{
    private readonly ILogger<ApiLoggingFilter> _logger;

    public ApiLoggingFilter(ILogger<ApiLoggingFilter> logger)
    {
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var httpContext = context.HttpContext;
        var request = httpContext.Request;
        var stopwatch = Stopwatch.StartNew();
        var controllerActionDescriptor = context.ActionDescriptor as ControllerActionDescriptor;

        var requestSummary = new
        {
            Controller = controllerActionDescriptor?.ControllerName,
            Action = controllerActionDescriptor?.ActionName,
            RouteValues = context.RouteData.Values,
            Query = request.Query.ToDictionary(
                pair => pair.Key,
                pair => LogValueFormatter.ToSafeLogValue(pair.Value.ToString())),
            Arguments = context.ActionArguments.ToDictionary(
                pair => pair.Key,
                pair => LogValueFormatter.ToSafeLogValue(pair.Value))
        };

        _logger.LogInformation(
            "API request started {Method} {Path} | TraceId={TraceId} | {@RequestSummary}",
            request.Method,
            request.Path,
            httpContext.TraceIdentifier,
            requestSummary);

        ActionExecutedContext executedContext;
        try
        {
            executedContext = await next();
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(
                ex,
                "API request failed {Method} {Path} after {ElapsedMs} ms | TraceId={TraceId} | {@RequestSummary}",
                request.Method,
                request.Path,
                stopwatch.Elapsed.TotalMilliseconds,
                httpContext.TraceIdentifier,
                requestSummary);
            throw;
        }

        stopwatch.Stop();

        var statusCode = executedContext.HttpContext.Response?.StatusCode;
        var resultSummary = BuildResultSummary(executedContext, statusCode);

        if (executedContext.Exception != null && !executedContext.ExceptionHandled)
        {
            _logger.LogError(
                executedContext.Exception,
                "API request failed {Method} {Path} after {ElapsedMs} ms | TraceId={TraceId} | {@ResultSummary}",
                request.Method,
                request.Path,
                stopwatch.Elapsed.TotalMilliseconds,
                httpContext.TraceIdentifier,
                resultSummary);
        }
        else
        {
            _logger.LogInformation(
                "API request completed {Method} {Path} with {StatusCode} in {ElapsedMs} ms | TraceId={TraceId} | {@ResultSummary}",
                request.Method,
                request.Path,
                statusCode,
                stopwatch.Elapsed.TotalMilliseconds,
                httpContext.TraceIdentifier,
                resultSummary);
        }
    }

    private static object? BuildResultSummary(ActionExecutedContext executedContext, int? fallbackStatusCode)
    {
        var result = executedContext.Result;

        return result switch
        {
            ObjectResult objectResult => new
            {
                StatusCode = objectResult.StatusCode ?? fallbackStatusCode,
                Value = LogValueFormatter.ToSafeLogValue(objectResult.Value)
            },
            IStatusCodeActionResult statusCodeActionResult => new
            {
                StatusCode = statusCodeActionResult.StatusCode
            },
            _ => new
            {
                StatusCode = fallbackStatusCode
            }
        };
    }
}

