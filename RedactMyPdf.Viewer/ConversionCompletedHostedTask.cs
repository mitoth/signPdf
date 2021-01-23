using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Viewer.Dtos;
using RedactMyPdf.Viewer.SignalR;
using RedactMyPdf.Viewer.Utils;
using Constants = RedactMyPdf.Core.MessageQueue.Constants;

namespace RedactMyPdf.Viewer
{
    public class ConversionCompletedHostedTask : BackgroundService
    {
        private readonly ILogger<ConversionCompletedHostedTask> logger;
        private readonly IConnectionFactory connectionFactory;
        private readonly IMemoryCache cache;
        private readonly IHubContext<FileProcessedHub> hub;
        private readonly IDocumentRepository documentRepository;

        private const string TopicExchangeName = Constants.Exchange.TopicExchangeName;


        public ConversionCompletedHostedTask(IConnectionFactory connectionFactory, ILogger<ConversionCompletedHostedTask> logger, IMemoryCache cache,
            IHubContext<FileProcessedHub> hub, IDocumentRepository documentRepository)
        {
            this.connectionFactory = connectionFactory;
            this.logger = logger;
            this.cache = cache;
            this.hub = hub;
            this.documentRepository = documentRepository;
        }


        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var topicConnection = connectionFactory.CreateConnection();
                using var topicChannel = topicConnection.CreateModel();
                topicChannel.ExchangeDeclare(exchange: TopicExchangeName, type: ExchangeType.Topic);
                var queueName = topicChannel.QueueDeclare().QueueName;
                topicChannel.QueueBind(queue: queueName,
                    exchange: TopicExchangeName,
                    routingKey: Constants.RoutingKeys.DoneConvertDocumentToJpgRoutingKey);
                topicChannel.QueueBind(queue: queueName,
                    exchange: TopicExchangeName,
                    routingKey: Constants.RoutingKeys.DoneBurnDocumentRoutingKey);
                logger.LogInformation(" [*] Waiting for completed conversion tasks.");

                var consumer = new EventingBasicConsumer(topicChannel);
                consumer.Received += async (model, ea) =>
                {
                    switch (ea.RoutingKey.ToLower())
                    {
                        case Constants.RoutingKeys.DoneConvertDocumentToJpgRoutingKey:
                            {
                                await ProcessCompletedConversionTask(stoppingToken, ea);
                                break;
                            }
                        case Constants.RoutingKeys.DoneBurnDocumentRoutingKey:
                            await ProcessCompletedBurnTask(stoppingToken, ea);
                            break;
                        default:
                            throw new NotSupportedException($"Error while processing done task information. Routing key {ea.RoutingKey} is not known");
                    }

                };
                topicChannel.BasicConsume(queue: queueName,
                    autoAck: true,
                    consumer: consumer);

                //keep it alive - not the best solution - maybe something like https://stackoverflow.com/questions/35058443/c-sharp-keep-event-handling-thread-alive-in-cpu-friendly-way
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception e)
            {
                logger.LogError(e, $"Cannot start the completed events listener");
            }
        }

        private async Task ProcessCompletedConversionTask(CancellationToken stoppingToken, BasicDeliverEventArgs ea)
        {
            var body = ea.Body.ToArray();
            var message = Encoding.ASCII.GetString(body);
            var processedFileId = JsonConvert.DeserializeObject<Guid>(message);
            if (cache.TryGetValue(processedFileId, out var signalRClientId) && signalRClientId is string clientId)
            {
                var addedDocument = await documentRepository.GetAsync(processedFileId, stoppingToken);
                var processedDocument = new ProcessedDocumentDto
                {
                    Id = processedFileId,
                    Pages = addedDocument.Pages.Select(p => new ProcessedPageImageDto(p.Width, p.Height)).ToList()
                };

                await hub.Clients.Client(clientId).SendAsync("FileProcessed",
                    JsonCamelCaseConverter.SerializeObject(processedDocument), stoppingToken);
            }

            logger.LogDebug($"Processed complete conversion task for file with id {processedFileId}");
        }

        private async Task ProcessCompletedBurnTask(CancellationToken stoppingToken, BasicDeliverEventArgs ea)
        {
            var body = ea.Body.ToArray();
            var message = Encoding.ASCII.GetString(body);
            var burnedFileId = JsonConvert.DeserializeObject<Guid>(message);
            if (cache.TryGetValue(burnedFileId, out var signalRClientId) && signalRClientId is string clientId)
            {
                await hub.Clients.Client(clientId).SendAsync("FileBurned",
                    JsonCamelCaseConverter.SerializeObject(burnedFileId), stoppingToken);
            }

            logger.LogDebug($"Processed complete conversion task for file with id {burnedFileId}");
        }
    }
}
