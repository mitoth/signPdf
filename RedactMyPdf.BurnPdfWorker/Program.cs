using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Utils;
using RedactMyPdf.FileHandler;
using RedactMyPdf.FileHandler.Docotic.Conversion;
using RedactMyPdf.FileHandler.Docotic.Drawing;
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
                Log.Logger.Warning($"Starting up burn pdf service on environment '{AppDataInfo.Environment()}'. {AppDataInfo.GetDbsInfo(config)}");
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception e)
            {
                Log.Logger.Fatal(e, "There was an exception starting up the burn pdf service");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseSerilog((context, config) => config.ReadFrom.Configuration(context.Configuration));
                    webBuilder.UseStartup<Startup>();
                });

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
