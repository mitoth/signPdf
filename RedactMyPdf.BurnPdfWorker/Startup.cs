using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.FileHandler;
using RedactMyPdf.FileHandler.Docotic.Conversion;
using RedactMyPdf.FileHandler.Docotic.Drawing;
using RedactMyPdf.FileHandler.Services.Drawing;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Repository.Mongo.Configuration;

namespace RedactMyPdf.BurnPdfWorker
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<IConnectionFactory>(s =>
            {
                var host = Configuration["RabbitMq:HostName"];
                var username = Configuration["RabbitMq:Username"];
                var password = Configuration["RabbitMq:Password"];

                return new ConnectionFactory
                {
                    HostName = host,
                    UserName = username,
                    Password = password
                };
            });

            services.AddScoped<IPdfToJpgConverter, PdfToJpgConverter>();
            services.AddSingleton<IShapesBurner, ShapesBurner>();
            services.AddSingleton<IBurnDocumentService, BurnDocumentService>();
            services.AddSingleton<IMongoClientConfiguration>(s =>
            {
                var host = Configuration["MongoSettings:Host"];
                var port = Configuration.GetValue<int>("MongoSettings:Port");
                var databaseName = Configuration["MongoSettings:Name"];
                var username = Configuration["MongoSettings:Username"];
                var password = Configuration["MongoSettings:Password"];
                var mongoClientSettings = CommonSettingsFactory.GetMongoConnectionString(host, port, username, password);
                return new MongoClientConfiguration(mongoClientSettings, databaseName);
            });
            services.AddSingleton<IFileRepository, FileRepository>();
            services.AddSingleton<IDocumentRepository, DocumentRepository>();
            services.AddSingleton<IBurnedDocumentRepository, BurnedDocumentRepository>();

            services.AddHostedService<Worker>();

            services.AddHealthChecks();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> logger)
        {
            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHealthChecks("/health");
            });
        }
    }
}