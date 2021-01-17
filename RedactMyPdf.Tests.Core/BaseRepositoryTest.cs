using RedactMyPdf.Repository.Mongo.Configuration;

namespace RedactMyPdf.Tests.Core
{
    public class BaseRepositoryTest
    {
        private const string Host = "localhost";
        private const string DatabaseName = "belugatest";
        protected IMongoClientConfiguration MongoClientConfiguration;

        public BaseRepositoryTest() : this(DatabaseName)
        {
        }

        public BaseRepositoryTest(string databaseName)
        {
            var mongoClientSettings = CommonSettingsFactory.GetMongoClientSettings(Host, 27017);
            MongoClientConfiguration = new MongoClientConfiguration(mongoClientSettings, databaseName);
        }
    }
}
