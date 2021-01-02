using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using EnsureThat;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RabbitMQ.Client;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.MessageQueue;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;
using RedactMyPdf.Viewer.Dtos;
using RedactMyPdf.Viewer.Examples;
using RedactMyPdf.Viewer.Utils;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using Constants = RedactMyPdf.Core.MessageQueue.Constants;


namespace RedactMyPdf.Viewer.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly ILogger<DocumentController> logger;
        private readonly IFileRepository fileRepository;
        private readonly IDocumentRepository documentRepository;
        private readonly IBurnedDocumentRepository burnedDocumentRepository;
        private readonly IConnectionFactory connectionFactory;
        private readonly IMemoryCache cache;

        private const string ExchangeName = Constants.Exchange.DirectExchangeName;
        private const string ConvertQueueName = Constants.Queue.ConvertDocumentQueueName;
        private const string ConvertRoutingKey = Constants.RoutingKeys.ConvertDocumentToJpgRoutingKey;
        private const string BurnQueueName = Constants.Queue.BurnDocumentQueueName;
        private const string BurnRoutingKey = Constants.RoutingKeys.BurnDocumentRoutingKey;

        public DocumentController(ILogger<DocumentController> logger, IFileRepository fileRepository, IDocumentRepository documentRepository, IBurnedDocumentRepository burnedDocumentRepository, 
            IConnectionFactory connectionFactory, IMemoryCache cache)
        {
            this.logger = logger;
            this.fileRepository = fileRepository;
            this.documentRepository = documentRepository;
            this.burnedDocumentRepository = burnedDocumentRepository;
            this.connectionFactory = connectionFactory;
            this.cache = cache;
        }

        /// <summary>
        /// Upload and extract pages from a pdf file. Does multiple things for simplicity on the ui part
        /// </summary>
        /// <param name="file"></param>
        /// <param name="connectionId">SignalR client Id. Optional. Used to notify the client when the file conversion is finished</param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpPost]
        [SwaggerOperation("Upload and convert a pdf file", "Upload a pdf file and convert each page to an image. " +
                                                           "Returns the file id and number of pages")]
        [ProducesResponseType(typeof(Guid), StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadAndConvertPdfFile(IFormFile file, [FromQuery] string connectionId, CancellationToken cancellationToken)
        {
            EnsureArg.IsNotNull(file);

            //upload part
            if (!IsPdfFileExtension(file.FileName))
            {
                logger.LogWarning("Only pdf file extensions are allowed");
                return BadRequest("Only pdf file extensions are allowed");
            }

            if (!await IsPdfFileSignature(file, cancellationToken))
            {
                logger.LogWarning("Invalid PDF file");
                return BadRequest("Invalid PDF file");
            }

            await using var uploadStream = new MemoryStream();
            await file.CopyToAsync(uploadStream, cancellationToken);
            uploadStream.Position = 0;
            logger.LogDebug($"Successfully uploaded file [{file.FileName}]");

            var fileId = await fileRepository.AddAsync(new RawFile(file.FileName, uploadStream), cancellationToken);
            var toBeCreatedDocumentId = Guid.NewGuid();

            //convert part
            SendConvertMessage(fileId, toBeCreatedDocumentId);

            cache.Set(toBeCreatedDocumentId, connectionId);
      
            return Accepted(new ProcessedDocumentDto
            {
                Id = toBeCreatedDocumentId,
                Pages = new List<ProcessedPageImageDto>(){new ProcessedPageImageDto(1000, 1000)}
            });
        }

        [HttpGet]
        [Route("{documentId}/page/{pageNumber}/file")]
        [SwaggerOperation("Get a page from a file", "Get a page from a pdf file. The page is an image")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(File))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Produces("image/jpg")]
        public async Task<IActionResult> GetPage(Guid documentId, int pageNumber, CancellationToken cancellationToken)
        {
            EnsureArg.IsNotDefault(documentId, nameof(documentId));
            EnsureArg.IsGte(pageNumber, 1, nameof(pageNumber));
            logger.LogDebug($"Get page number [{pageNumber}] from document with id {documentId}");
            var document = await documentRepository.GetAsync(documentId, cancellationToken);
            if (document == null)
            {
                logger.LogWarning($"Document with id {documentId} was not found");
                return NotFound($"Document with id [{documentId}] was not found");
            }

            if (pageNumber > document.Pages.Count())
            {
                logger.LogWarning($"Cannot find page number [{pageNumber}]. Document only has [{document.Pages.Count()}]");
                return NotFound(
                    $"Cannot find page number [{pageNumber}]. Document only has [{document.Pages.Count()}]");
            }

            logger.LogDebug($"Found page number [{pageNumber}] from document with id {documentId}. Returning it");
            var pageId = document.Pages.ElementAt(pageNumber - 1).FileBinaryId;
            await using var pageStream = await fileRepository.GetAsync(pageId, cancellationToken);
            var memoryStream = new MemoryStream();
            await pageStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
            return File(memoryStream, "image/jpg", $"{documentId}_{pageNumber}.jpg");
        }

        /// <summary>
        /// Burn shapes to document.
        /// </summary>
        /// <param name="documentId"></param>
        /// <param name="shapesList"></param>
        /// <param name="connectionId">SignalR client Id. Optional. The client with this is will be notified when the file burn is finished</param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpPost]
        [SwaggerRequestExample(typeof(PageShapes), typeof(ListPageShapesExample), typeof(DefaultContractResolver))]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [Route("{documentId}/burn")]
        public IActionResult BurnShapesToDocument(Guid documentId, [FromBody] [ModelBinder(BinderType = typeof(ShapeModelBinder))] List<PageShapes> shapesList,
            [FromQuery] string connectionId, CancellationToken cancellationToken)
        {
            EnsureArg.IsNotDefault(documentId, nameof(documentId));
            var documentShapes = new DocumentShapes(shapesList);
            cache.Set(documentId, connectionId);
            SendBurnMessage(documentId, documentShapes);
            return Accepted();
        }

        [HttpGet]
        [Route("{documentId}/burn")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(File))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Produces("application/pdf")]
        public async Task<IActionResult> GetBurnedFile(Guid documentId, CancellationToken cancellationToken)
        {
            EnsureArg.IsNotDefault(documentId, nameof(documentId));
            var burnedDocument = await GetBurnedDocument(documentId, cancellationToken);
            return await GetBurnedFile(documentId, cancellationToken, burnedDocument);
        }

        private async Task<IActionResult> GetBurnedFile(Guid documentId, CancellationToken cancellationToken, BurnedDocument burnedDocument)
        {
            if (burnedDocument == null)
            {
                return NotFound($"Cannot find any burned document for document with id [{documentId}]");
            }

            logger.LogDebug(
                $"Found burned document with id [{documentId}]. Looking for associated file with id {burnedDocument.FileBinaryId}");
            await using var burnedFileStream = await fileRepository.GetAsync(burnedDocument.FileBinaryId, cancellationToken);
            var memoryStream = new MemoryStream();
            await burnedFileStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
            return File(memoryStream, "application/pdf", $"{documentId}.pdf");
        }

        private async Task<BurnedDocument> GetBurnedDocument(Guid documentId, CancellationToken cancellationToken)
        {
            logger.LogDebug($"Getting burned version of document with id [{documentId}]");
            var burnedDocument = await burnedDocumentRepository.GetAsync(documentId, cancellationToken);
            return burnedDocument;
        }

        //temporary - replace with signalR or add another rabbit queue for processed messages (type of mq should be fanout)
        private async Task WaitForFileToBeBurned(Guid documentId, CancellationToken cancellationToken)
        {
            await Task.Run(async () =>
            {
                var timeout = 100;
                var spentTime = 0;
                BurnedDocument doc = null;
                while (spentTime < timeout && doc == null)
                {
                    spentTime++;
                    doc = await GetBurnedDocument(documentId, cancellationToken);
                }
            }, cancellationToken);
        }

        private static async Task<bool> IsPdfFileSignature(IFormFile file, CancellationToken cancellationToken)
        {
            //https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-3.1#validation


            await using var testStream = new MemoryStream();
            await file.CopyToAsync(testStream, cancellationToken);
            testStream.Position = 0;

            using var reader = new BinaryReader(testStream);
            var pdfFileSignature = new List<byte[]>
            {
                new byte[] {0x25, 0x50, 0x44, 0x46}
            };
            var headerBytes = reader.ReadBytes(pdfFileSignature.Count);

            return !pdfFileSignature.Any(signature =>
                headerBytes.Take(signature.Length).SequenceEqual(signature));
        }

        private static bool IsPdfFileExtension(string fileName)
        {
            //https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-3.1#validation
            string[] permittedExtensions = { ".pdf" };

            var ext = Path.GetExtension(fileName).ToLowerInvariant();

            return !string.IsNullOrWhiteSpace(ext) && permittedExtensions.Contains(ext);
        }

        private void SendConvertMessage(string fileBinaryId, Guid toBeCreatedDocumentId)
        {
            logger.LogInformation("Setting up messaging queue for convert");
            using var connection = connectionFactory.CreateConnection();
            using var channel = connection.CreateModel();
            channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct);
            channel.QueueDeclare(ConvertQueueName, true, false);
            channel.QueueBind(ConvertQueueName, ExchangeName, ConvertRoutingKey);
            channel.BasicQos(0, 10, false);

            logger.LogInformation($"Sending convert message for fileBinaryId: [{fileBinaryId}] and toBeCreatedDocumentId: [{toBeCreatedDocumentId}]");
            var convertMessage = new ConvertToPdfMessage(fileBinaryId, toBeCreatedDocumentId);
            // ReSharper disable once MethodHasAsyncOverload
            var convertM = JsonConvert.SerializeObject(convertMessage);
            var byteArray = Encoding.ASCII.GetBytes(convertM);

            channel.BasicPublish(ExchangeName, ConvertRoutingKey, null, byteArray);
        }

        private void SendBurnMessage(Guid documentId, DocumentShapes documentShapes)
        {
            logger.LogInformation("Setting up messaging queue for burn");
            using var connection = connectionFactory.CreateConnection();
            using var channel = connection.CreateModel();
            channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct);
            channel.QueueDeclare(BurnQueueName, true, false);
            channel.QueueBind(BurnQueueName, ExchangeName, BurnRoutingKey);
            channel.BasicQos(0, 10, false);

            logger.LogInformation($"Sending burn shapes message for documentId: [{documentId}] and document shapes: [{documentShapes}]");
            var burnMessage = new BurnShapesToPdfMessage(documentId, documentShapes);
            // ReSharper disable once MethodHasAsyncOverload
            var convertM = JsonConvert.SerializeObject(burnMessage);
            var byteArray = Encoding.ASCII.GetBytes(convertM);

            channel.BasicPublish(ExchangeName, BurnRoutingKey, null, byteArray);
        }
    }
}
