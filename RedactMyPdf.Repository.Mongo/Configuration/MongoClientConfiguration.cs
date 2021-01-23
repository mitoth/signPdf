using MongoDB.Driver;

namespace RedactMyPdf.Repository.Mongo.Configuration
{
    public class MongoClientConfiguration : MongoClient, IMongoClientConfiguration
    {
        private readonly string connectionString;
        private readonly string databaseName;

        public MongoClientConfiguration(string connectionString, string databaseName) : base(connectionString)
        {
            this.connectionString = connectionString;
            this.databaseName = databaseName;

            ClassMappings.SetMappings();
        }

        public IMongoClient GetClient() => new MongoClient(connectionString);

        public IMongoDatabase GetDatabase() => GetDatabase(databaseName);

    }
}
