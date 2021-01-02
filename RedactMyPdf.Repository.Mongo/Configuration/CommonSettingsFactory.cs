using MongoDB.Bson;
using MongoDB.Driver;

namespace RedactMyPdf.Repository.Mongo.Configuration
{
    public static class CommonSettingsFactory
    {
        public static MongoClientSettings GetMongoClientSettings(string host, int port)
        {
            return new MongoClientSettings
            {
                Server = new MongoServerAddress(host, port),
                GuidRepresentation = GuidRepresentation.Standard
            };
        }
    }
}
