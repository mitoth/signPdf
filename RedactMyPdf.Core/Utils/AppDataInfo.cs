using Microsoft.Extensions.Configuration;

namespace RedactMyPdf.Core.Utils
{
    public static class AppDataInfo
    {
        public static string GetDbsInfo(IConfiguration config)
        {
            var rabbitHost = config["RabbitMq:HostName"];
            var mongoHost = config["MongoSettings:Host"];
            return $"Rabbit on server '{rabbitHost}'. Mongo on server '{mongoHost}'";
        }
        
        public static string Environment()
        {
            return System.Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "";
        }
    }
}