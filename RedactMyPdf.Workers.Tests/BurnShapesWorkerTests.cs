using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
using RedactMyPdf.Core.Models.Draw;
using RedactMyPdf.FileHandler.Aspose.Conversion;
using RedactMyPdf.FileHandler.Services.Conversion;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Tests.Core;
using Constants = RedactMyPdf.Core.MessageQueue.Constants;

namespace RedactMyPdf.Workers.Tests
{
    public class BurnShapesWorkerTests : BaseRepositoryTest
    {
        private const string ExchangeName = Constants.Exchange.DirectExchangeName;
        private const string QueueName = Constants.Queue.BurnDocumentQueueName;
        private const string RoutingKey = Constants.RoutingKeys.BurnDocumentRoutingKey;
        private const string DatabaseName = "beluga";

        private static readonly string OutputFolderPath = $"{Assembly.GetExecutingAssembly().Location}\\..\\..\\..\\PdfTestFiles\\TestOutput";

        public BurnShapesWorkerTests() : base(DatabaseName)
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
        public async Task TestBurnShapesWorker()
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

            var loggerDocMock = new Mock<ILogger<DocumentRepository>>();
            var documentRepository = new DocumentRepository(MongoClientConfiguration, loggerDocMock.Object);
            var pdfToJpgConverter = new PdfToJpgConverter();
            var loggerConverterMock = new Mock<ILogger<ConvertPdfToJpgService>>();
            var converter = new ConvertPdfToJpgService(fileRepository, pdfToJpgConverter, documentRepository, loggerConverterMock.Object);
            var convertedDocument = await converter.ConvertAsync(fileId, Guid.NewGuid(), CancellationToken.None);
            Assert.AreEqual(4, convertedDocument.Pages.Count());

            var shapes = new List<PageShapes>
            {
                new PageShapes(1, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                }),
                new PageShapes(2, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                }),
                new PageShapes(3, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                }),
                new PageShapes(4, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                })
            };
            var burnShapesMessage = new BurnShapesToPdfMessage(convertedDocument.Id, shapes);

            // ReSharper disable once MethodHasAsyncOverload
            var convertM = JsonConvert.SerializeObject(burnShapesMessage);
            var byteArray = Encoding.ASCII.GetBytes(convertM);

            channel.BasicPublish(ExchangeName, RoutingKey, null, byteArray);
        }
    }
}
