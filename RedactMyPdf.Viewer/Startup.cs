using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Prometheus;
using RabbitMQ.Client;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Utils;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Repository.Mongo.Configuration;
using RedactMyPdf.Viewer.SignalR;
using Swashbuckle.AspNetCore.Filters;

namespace RedactMyPdf.Viewer
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

            services.AddControllers();
            services.AddSignalR();

            services.AddCors(corsOptions =>
            {
                corsOptions.AddPolicy("AllowAllOrigins", policy =>
                {
                    policy.AllowAnyHeader()
                        .AllowAnyMethod()
                        .WithOrigins("http://localhost:8081")
                        .AllowCredentials();
                });
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "Beluga Viewer API",
                    Description = "Documentation for the Beluga Viewer API endpoints"
                });
                c.EnableAnnotations();
                c.ExampleFilters();
            });

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

            services.AddSingleton<IFileRepository, FileRepository>();
            services.AddSingleton<IDocumentRepository, DocumentRepository>();
            services.AddSingleton<IBurnedDocumentRepository, BurnedDocumentRepository>();
            services.AddSingleton<IMemoryCache, MemoryCache>();

            services.AddSwaggerExamplesFromAssemblies(Assembly.GetEntryAssembly());

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });


            // services.AddSingleton<IHostedService, ConversionCompletedHostedTask>();
            //var completedTasksService = new ConversionCompletedHostedTask(services.);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> logger)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseCors("AllowAllOrigins");
            app.UseRouting();

            app.UseAuthorization();

            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Beluga Viewer API"));

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<FileProcessedHub>("/hubs/files");
                endpoints.MapMetrics();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });

            var completedTasks = new ConversionCompletedHostedTask(app.ApplicationServices.GetService<IConnectionFactory>(),
                app.ApplicationServices.GetService<ILogger<ConversionCompletedHostedTask>>(), app.ApplicationServices.GetService<IMemoryCache>(),
                app.ApplicationServices.GetService<IHubContext<FileProcessedHub>>(), app.ApplicationServices.GetService<IDocumentRepository>());

            Task.Run(async () =>
            {
                logger.LogWarning($"Trying....");
                await completedTasks.ExecuteAsync(CancellationToken.None);
                logger.LogWarning($"Done trying");

            });
            
            logger.LogWarning($"Started web api on environment {AppDataInfo.Environment()}. {AppDataInfo.GetDbsInfo(Configuration)}");
        }
    }
}
