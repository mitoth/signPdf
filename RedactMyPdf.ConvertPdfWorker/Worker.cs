using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RedactMyPdf.Core.MessageQueue;
using RedactMyPdf.FileHandler.Services.Conversion;
using Constants = RedactMyPdf.Core.MessageQueue.Constants;

namespace RedactMyPdf.ConvertPdfWorker
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> logger;
        private readonly IConnectionFactory connectionFactory;
        private readonly IConvertPdfToJpgService converter;

        private const string DirectExchangeName = Core.MessageQueue.Constants.Exchange.DirectExchangeName;
        private const string QueueName = Core.MessageQueue.Constants.Queue.ConvertDocumentQueueName;
        private const string RoutingKey = Core.MessageQueue.Constants.RoutingKeys.ConvertDocumentToJpgRoutingKey;

        private const string TopicExchangeName = Constants.Exchange.TopicExchangeName;

        public Worker(ILogger<Worker> logger, IConnectionFactory connectionFactory, IConvertPdfToJpgService converter)
        {
            this.logger = logger;
            this.connectionFactory = connectionFactory;
            this.converter = converter;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Setting up messaging queue");

            //setup direct exchange and queue - used for receiving convert tasks
            using var directConnection = connectionFactory.CreateConnection();
            using var directChannel = directConnection.CreateModel();
            directChannel.ExchangeDeclare(DirectExchangeName, ExchangeType.Direct);
            directChannel.QueueDeclare(QueueName, true, false);
            directChannel.QueueBind(QueueName, DirectExchangeName, RoutingKey);
            directChannel.BasicQos(0, 10, false);
            logger.LogInformation("Done. Incoming message queuing setup. Waiting for messages to process");

            //setup topic exchange - used for signaling that the convert task was finished
            using var topicConnection = connectionFactory.CreateConnection();
            using var topicChannel = topicConnection.CreateModel();
            topicChannel.ExchangeDeclare(exchange: TopicExchangeName, type: ExchangeType.Topic);

            var consumer = new EventingBasicConsumer(directChannel);
            consumer.Received += async (model, ea) =>
            {
                logger.LogDebug("Message received. Start processing");
                try
                {
                    var body = ea.Body;
                    var arrayBody = Encoding.UTF8.GetString(body.ToArray());
                    var message = JsonConvert.DeserializeObject<ConvertToPdfMessage>(arrayBody);
                    logger.LogDebug($"Received convert message for file with id {message.FileBinaryId}");
                    var document = await converter.ConvertAsync(message.FileBinaryId, message.NewDocumentGuid, stoppingToken);
                    logger.LogInformation(
                        $"Converted file with id {message.FileBinaryId}. Stored associated document with id {document.Id}. " +
                        $"Are {document.Pages.Count()} pagini");
                    // ReSharper disable once AccessToDisposedClosure
                    directChannel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);


                    var convertDoneMessage = JsonConvert.SerializeObject(message.NewDocumentGuid);
                    var byteArray = Encoding.ASCII.GetBytes(convertDoneMessage);
                    topicChannel.BasicPublish(TopicExchangeName, Constants.RoutingKeys.DoneConvertDocumentToJpgRoutingKey, null, byteArray);
                }
                catch (Exception e)
                {
                    logger.LogError(e, "Error while processing message");
                }
            };

            directChannel.BasicConsume(QueueName, false, consumer);

            while (!stoppingToken.IsCancellationRequested)
            {

            }
        }
    }
}
