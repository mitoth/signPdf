using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace RedactMyPdf.Viewer.Utils
{
    public static class JsonCamelCaseConverter
    {
        public static string SerializeObject(object value)
        {
            var serializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            return JsonConvert.SerializeObject(value, serializerSettings);
        }
    }
}