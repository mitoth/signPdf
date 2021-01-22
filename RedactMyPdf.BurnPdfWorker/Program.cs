using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.FileHandler;
using RedactMyPdf.FileHandler.Aspose.Conversion;
using RedactMyPdf.FileHandler.Aspose.Drawing;
using RedactMyPdf.FileHandler.Services.Drawing;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Repository.Mongo.Configuration;
using Serilog;

namespace RedactMyPdf.BurnPdfWorker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var config = LoadConfiguration();

            Log.Logger = new LoggerConfiguration().ReadFrom.Configuration(config).CreateLogger();
            try
            {
                Log.Information($"Starting up burn pdf service on environment '{Environment()}'");
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception e)
            {
                Log.Fatal(e, "There was an exception starting up the burn pdf service");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    var config = hostContext.Configuration;
                    services.AddSingleton<IConnectionFactory>(s =>
                    {
                        var host = config["RabbitMq:HostName"];
                        var username = config["RabbitMq:Username"];
                        var password = config["RabbitMq:Password"];

                        return new ConnectionFactory
                        {
                            HostName = host,
                            UserName = username,
                            Password = password
                        };
                    });

                    services.AddScoped<IPdfToJpgConverter, PdfToJpgConverter>();
                    services.AddSingleton<IDrawService, DrawService>();
                    services.AddSingleton<IBurnDocumentService, BurnDocumentService>();
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
                    services.AddSingleton<IBurnedDocumentRepository, BurnedDocumentRepository>();

                    services.AddHostedService<Worker>();
                })
                .UseSerilog();

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
            return System.Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "";
        }
    }
}
