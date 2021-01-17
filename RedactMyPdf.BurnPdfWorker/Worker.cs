using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using EnsureThat;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RedactMyPdf.Core.MessageQueue;
using RedactMyPdf.Core.Utils;
using RedactMyPdf.FileHandler.Services.Drawing;
using Constants = RedactMyPdf.Core.MessageQueue.Constants;

namespace RedactMyPdf.BurnPdfWorker
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> logger;
        private readonly IConnectionFactory connectionFactory;
        private readonly IBurnDocumentService burnDocumentService;

        private const string ExchangeName = Core.MessageQueue.Constants.Exchange.DirectExchangeName;
        private const string QueueName = Core.MessageQueue.Constants.Queue.BurnDocumentQueueName;
        private const string RoutingKey = Core.MessageQueue.Constants.RoutingKeys.BurnDocumentRoutingKey;

        private const string TopicExchangeName = Constants.Exchange.TopicExchangeName;

        public Worker(ILogger<Worker> logger, IConnectionFactory connectionFactory, IBurnDocumentService burnDocumentService)
        {
            this.logger = logger;
            this.connectionFactory = connectionFactory;
            this.burnDocumentService = burnDocumentService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Setting up messaging queue");
            using var connection = connectionFactory.CreateConnection();
            using var channel = connection.CreateModel();
            channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct);
            channel.QueueDeclare(QueueName, true, false);
            channel.QueueBind(QueueName, ExchangeName, RoutingKey);
            channel.BasicQos(0, 10, false);
            logger.LogInformation("Done. Message queuing setup. Waiting for messages to process");


            //setup topic exchange - used for signaling that the burn task was finished
            using var topicConnection = connectionFactory.CreateConnection();
            using var topicChannel = topicConnection.CreateModel();
            topicChannel.ExchangeDeclare(exchange: TopicExchangeName, type: ExchangeType.Topic);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
            {
                logger.LogDebug("Message received. Start processing");
                try
                {
                    var body = ea.Body;
                    var arrayBody = Encoding.UTF8.GetString(body.ToArray());
                    var message = JsonConvert.DeserializeObject<BurnShapesToPdfMessage>(arrayBody, new JsonSerializerSettings() { Converters = new List<JsonConverter> { new ShapeJsonConverter() } });
                    EnsureArg.IsNotNull(message, nameof(message));
                    EnsureArg.IsNotDefault(message.DocumentId, nameof(message.DocumentId));
                    EnsureArg.IsNotNull(message.DocumentShapes, nameof(message.DocumentShapes));
                    logger.LogDebug($"Received burn message for file with id {message.DocumentId}");
                    await burnDocumentService.BurnShapes(message.DocumentId,
                        message.DocumentShapes, stoppingToken);
                    logger.LogDebug($"Burned shapes to document with id [{message.DocumentId}]. Shapes burned: [{message.DocumentShapes}]");

                    var convertDoneMessage = JsonConvert.SerializeObject(message.DocumentId);
                    var byteArray = Encoding.ASCII.GetBytes(convertDoneMessage);
                    topicChannel.BasicPublish(TopicExchangeName, Constants.RoutingKeys.DoneBurnDocumentRoutingKey, null, byteArray);
                }
                catch (Exception e)
                {
                    logger.LogError(e, "Error while processing message");
                }
            };

            channel.BasicConsume(QueueName, true, consumer);
            while (!stoppingToken.IsCancellationRequested)
            {

            }
        }
    }
}
