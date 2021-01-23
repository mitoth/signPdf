using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using Serilog;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Utils;
using RedactMyPdf.FileHandler;
using RedactMyPdf.FileHandler.Aspose.Conversion;
using RedactMyPdf.FileHandler.Services.Conversion;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Repository.Mongo.Configuration;


namespace RedactMyPdf.ConvertPdfWorker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var config = LoadConfiguration();

            Log.Logger = new LoggerConfiguration().ReadFrom.Configuration(config).CreateLogger();
            try
            {
                Log.Information($"Starting up convert pdf service on environment {AppDataInfo.Environment()}. {AppDataInfo.GetDbsInfo(config)}");
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception e)
            {
                Log.Fatal(e, "There was an exception starting up the convert pdf service");
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

                    services.AddSingleton<IPdfToJpgConverter, PdfToJpgConverter>();
                    services.AddSingleton<IConvertPdfToJpgService, ConvertPdfToJpgService>();
                    services.AddSingleton<IMongoClientConfiguration>(s =>
                    {
                        var host = config["MongoSettings:Host"];
                        var port = config.GetValue<int>("MongoSettings:Port");
                        var databaseName = config["MongoSettings:Name"];
                        var username = config["MongoSettings:Username"];
                        var password = config["MongoSettings:Password"];
                        var mongoClientSettings = CommonSettingsFactory.GetMongoConnectionString(host, port, username, password);
                        return new MongoClientConfiguration(mongoClientSettings, databaseName);
                    });
                    services.AddSingleton<IFileRepository, FileRepository>();
                    services.AddSingleton<IDocumentRepository, DocumentRepository>();

                    services.AddHostedService<Worker>();
                })
                .UseSerilog();

        public static IConfiguration LoadConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{AppDataInfo.Environment()}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            return builder.Build();
        }
    }
}
