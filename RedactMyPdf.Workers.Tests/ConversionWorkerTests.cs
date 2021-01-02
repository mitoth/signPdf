using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using NUnit.Framework;
using RabbitMQ.Client;
using RedactMyPdf.Core.MessageQueue;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Tests.Core;
using Constants = RedactMyPdf.Core.MessageQueue.Constants;


namespace RedactMyPdf.Workers.Tests
{
    public class ConversionWorkerTests : BaseRepositoryTest
    {
        private const string ExchangeName = Constants.Exchange.DirectExchangeName;
        private const string QueueName = Constants.Queue.ConvertDocumentQueueName;
        private const string RoutingKey = Constants.RoutingKeys.ConvertDocumentToJpgRoutingKey;
        private const string DatabaseName = "beluga";

        private static readonly string OutputFolderPath = $"{Assembly.GetExecutingAssembly().Location}\\..\\..\\..\\PdfTestFiles\\TestOutput";

        public ConversionWorkerTests() : base(DatabaseName)
        {
        }

        /// <summary>
        /// Creates the output directory
        /// </summary>
        [OneTimeSetUp]
        public void Initialize()
        {
            if (Directory.Exists(OutputFolderPath))
            {
                return;
            }

            // create the output test directory
            Directory.CreateDirectory(OutputFolderPath);
        }

        [Test]
        public async Task TestConversionWorker()
        {
            var factory = new ConnectionFactory()
            {
                HostName = "localhost",
                UserName = "guest",
                Password = "guest"
            };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();
            channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct);
            channel.QueueDeclare(QueueName, true, false);
            channel.QueueBind(QueueName, ExchangeName, RoutingKey);

            var testFilesParentDirectory = new DirectoryInfo($"{Assembly.GetExecutingAssembly().Location}").Parent
                ?.Parent?.Parent?.Parent;
            var inputPdfFilePath = $"{testFilesParentDirectory}\\PdfTestFiles\\test4PagesDocument.pdf";
            var inputPdf = new FileInfo(inputPdfFilePath);

            var fileBinary = await File.ReadAllBytesAsync(inputPdf.FullName);
            await using var stream = new MemoryStream(fileBinary);

            var loggerMock = new Mock<ILogger<FileRepository>>();
            var fileRepository = new FileRepository(MongoClientConfiguration, loggerMock.Object);
            var fileId = await fileRepository.AddAsync(new RawFile("test", stream), CancellationToken.None);

            await using var fileStream = await fileRepository.GetAsync(fileId, CancellationToken.None);
            Assert.NotNull(fileStream);

            var convertMessage = new ConvertToPdfMessage(fileId, Guid.NewGuid());
            // ReSharper disable once MethodHasAsyncOverload
            var convertM = JsonConvert.SerializeObject(convertMessage);
            var byteArray = Encoding.ASCII.GetBytes(convertM);

            channel.BasicPublish(ExchangeName, RoutingKey, null, byteArray);
        }
    }
}