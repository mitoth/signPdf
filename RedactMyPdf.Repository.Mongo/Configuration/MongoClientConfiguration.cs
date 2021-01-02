using MongoDB.Driver;

namespace RedactMyPdf.Repository.Mongo.Configuration
{
    public class MongoClientConfiguration : MongoClient, IMongoClientConfiguration
    {
        private readonly MongoClientSettings mongoClientSettings;
        private readonly string databaseName;

        public MongoClientConfiguration(MongoClientSettings mongoClientSettings, string databaseName) : base(mongoClientSettings)
        {
            this.mongoClientSettings = mongoClientSettings;
            this.databaseName = databaseName;

            ClassMappings.SetMappings();
        }

        public IMongoClient GetClient() => new MongoClient(mongoClientSettings);

        public IMongoDatabase GetDatabase() => GetDatabase(databaseName);

    }
}
