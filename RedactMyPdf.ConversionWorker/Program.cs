using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.FileHandler;
using RedactMyPdf.FileHandler.Aspose.Conversion;
using RedactMyPdf.FileHandler.Services.Conversion;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Repository.Mongo.Configuration;
using Serilog;

namespace RedactMyPdf.ConversionWorker
{
    class Program
    {
        static void Main()
        {
            var services = ConfigureServices();

            var serviceProvider = services.BuildServiceProvider();

            // calls the Run method in App, which is replacing Main
            serviceProvider.GetService<ConvertApp>().Run();
        }

        private static IServiceCollection ConfigureServices()
        {
            IServiceCollection services = new ServiceCollection();

            var config = LoadConfiguration();
            services.AddSingleton(config);
            services.AddLogging(builder =>
            {
                var serilogger = new LoggerConfiguration().ReadFrom.Configuration(config).CreateLogger();
                builder.AddSerilog(serilogger);
            });

            services.AddSingleton<IConnectionFactory>(s =>
            {
                var host = config["RabbitMq:HostName"];
                var username = config["RabbitMq:Username"];
                var password = config["RabbitMq:Password"];

                return new ConnectionFactory()
                {
                    HostName = host,
                    UserName = username,
                    Password = password
                };
            });

            services.AddScoped<IPdfToJpgConverter, PdfToJpgConverter>();
            services.AddSingleton<IConvertPdfToJpgService, ConvertPdfToJpgService>();
            services.AddSingleton<IMongoClientConfiguration>(s =>
            {
                var host = config["MongoSettings:Host"];
                var port = config.GetValue<int>("MongoSettings:Port");
                var databaseName = config["MongoSettings:Name"];
                var mongoClientSettings = CommonSettingsFactory.GetMongoClientSettings(host, port);
                return new MongoClientConfiguration(mongoClientSettings, databaseName);
            });
            services.AddSingleton<IFileRepository, FileRepository>();
            services.AddSingleton<IDocumentRepository, DocumentRepository>();

            // required to run the application
            services.AddTransient<ConvertApp>();

            return services;
        }

        public static IConfiguration LoadConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{Environment()}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            return builder.Build();
        }

        public static string Environment()
        {
            return System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "";
        }
    }
}
