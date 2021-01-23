using RedactMyPdf.Repository.Mongo.Configuration;

namespace RedactMyPdf.Tests.Core
{
    public class BaseRepositoryTest
    {
        private const string Host = "localhost";
        private const string DatabaseName = "belugatest";
        protected readonly IMongoClientConfiguration MongoClientConfiguration;

        protected BaseRepositoryTest() : this(DatabaseName)
        {
        }

        protected BaseRepositoryTest(string databaseName)
        {
            var mongoClientSettings = CommonSettingsFactory.GetMongoConnectionString(Host, 27017);
            MongoClientConfiguration = new MongoClientConfiguration(mongoClientSettings, databaseName);
        }
    }
}
