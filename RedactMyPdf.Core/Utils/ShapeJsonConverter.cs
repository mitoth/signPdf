#nullable enable
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedactMyPdf.Core.Models.Draw;
using JsonConverter = Newtonsoft.Json.JsonConverter;

namespace RedactMyPdf.Core.Utils
{
    public class ShapeJsonConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
        {
            JObject jObject = JObject.Load(reader);
            if (FieldExists("Width", jObject) && FieldExists("Height", jObject))
            {
                var rectangle = jObject.ToObject<Rectangle>(serializer);
                if (rectangle != null)
                {
                    return rectangle;
                }
            }

            if (FieldExists("Text", jObject))
            {
                var textBox = jObject.ToObject<TextBox>(serializer);
                if (textBox != null)
                {
                    return textBox;
                }
            }

            throw new NotSupportedException($"Cannot convert [{jObject}] to a shape");
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(Shape);
        }

        protected Shape Create(Type objectType, JObject jObject, JsonSerializer serializer)
        {
            if (FieldExists("Width", jObject) && FieldExists("Height", jObject))
            {
                var rectangle = jObject.ToObject<Rectangle>(serializer);
                if (rectangle != null)
                {
                    return rectangle;
                }
            }

            if (FieldExists("Text", jObject))
            {
                var textBox = jObject.ToObject<TextBox>(serializer);
                if (textBox != null)
                {
                    return textBox;
                }
            }

            throw new NotSupportedException($"Cannot convert [{jObject}] to a shape");
        }

        private static bool FieldExists(string fieldName, JObject jObject)
        {
            return jObject[fieldName] != null || jObject[fieldName.ToLower()] != null;
        }
    }
}
