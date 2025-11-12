using System.Collections;
using System.Text.Json;

namespace SmartScheduler.Logging;

public static class LogValueFormatter
{
    private const int MaxStringLength = 500;

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public static object? ToSafeLogValue(object? value)
    {
        if (value is null)
        {
            return null;
        }

        if (value is string stringValue)
        {
            if (stringValue.Length <= MaxStringLength)
            {
                return stringValue;
            }

            return $"{stringValue.Substring(0, MaxStringLength)}... (truncated, {stringValue.Length} characters total)";
        }

        if (value is CancellationToken)
        {
            return "CancellationToken";
        }

        if (value is IEnumerable enumerable && value is not string)
        {
            if (enumerable is ICollection collection)
            {
                return $"{value.GetType().Name} (Count = {collection.Count})";
            }

            if (value is IQueryable queryable)
            {
                return $"{value.GetType().Name} (IQueryable, expression = {queryable.Expression})";
            }

            return $"{value.GetType().Name} (IEnumerable)";
        }

        var type = value.GetType();
        if (IsSimple(type))
        {
            return value;
        }

        try
        {
            return JsonSerializer.Serialize(value, SerializerOptions);
        }
        catch
        {
            return value.ToString();
        }
    }

    private static bool IsSimple(Type type)
    {
        return type.IsPrimitive
            || type.IsEnum
            || type == typeof(decimal)
            || type == typeof(DateTime)
            || type == typeof(DateTimeOffset)
            || type == typeof(TimeSpan)
            || type == typeof(Guid);
    }
}

