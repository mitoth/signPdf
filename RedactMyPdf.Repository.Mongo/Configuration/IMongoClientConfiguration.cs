using MongoDB.Driver;

namespace RedactMyPdf.Repository.Mongo.Configuration
{
    public interface IMongoClientConfiguration
    {
        IMongoDatabase GetDatabase();

        IMongoClient GetClient();
    }
}
