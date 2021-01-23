using MongoDB.Bson;
using MongoDB.Driver;

namespace RedactMyPdf.Repository.Mongo.Configuration
{
    public static class CommonSettingsFactory
    {
        public static string GetMongoConnectionString(string host, int port, string user = null, string password = null)
        {
            if (!string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(password))
            {
                return $"mongodb://{user}:{password}@{host}:{port}";
            }

            return $"mongodb://{host}:{port}";
        }
    }
}
