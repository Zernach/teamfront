using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartScheduler.Converters;

public class TimeSpanJsonConverter : JsonConverter<TimeSpan>
{
    public override TimeSpan Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value))
            {
                return TimeSpan.Zero;
            }
            
            // Try parsing as "HH:mm:ss" format
            if (TimeSpan.TryParse(value, out var timeSpan))
            {
                return timeSpan;
            }
            
            // Try parsing as "HH:mm:ss" format explicitly
            var parts = value.Split(':');
            if (parts.Length == 3 && 
                int.TryParse(parts[0], out var hours) &&
                int.TryParse(parts[1], out var minutes) &&
                int.TryParse(parts[2], out var seconds))
            {
                return new TimeSpan(hours, minutes, seconds);
            }
        }
        else if (reader.TokenType == JsonTokenType.Number)
        {
            // Handle numeric value (ticks or total seconds)
            var ticks = reader.GetInt64();
            return TimeSpan.FromTicks(ticks);
        }
        
        throw new JsonException($"Unable to convert \"{reader.GetString()}\" to TimeSpan.");
    }

    public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
    {
        // Write as "HH:mm:ss" format
        writer.WriteStringValue(value.ToString(@"hh\:mm\:ss"));
    }
}

