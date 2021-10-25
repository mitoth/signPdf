using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EnsureThat;
using Microsoft.Extensions.Logging;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Models;

namespace RedactMyPdf.FileHandler.Services.Conversion
{
    public class ConvertPdfToJpgService : IConvertPdfToJpgService
    {
        private readonly IFileRepository fileRepository;
        private readonly IPdfToJpgConverter pdfToJpgConverter;
        private readonly IDocumentRepository documentRepository;
        private readonly ILogger<IConvertPdfToJpgService> logger;

        public ConvertPdfToJpgService(IFileRepository fileRepository, IPdfToJpgConverter pdfToJpgConverter,
            IDocumentRepository documentRepository, ILogger<IConvertPdfToJpgService> logger)
        {
            this.fileRepository = fileRepository;
            this.pdfToJpgConverter = pdfToJpgConverter;
            this.documentRepository = documentRepository;
            this.logger = logger;
            BitMiracle.Docotic.LicenseManager.AddLicenseData("6Y1MS-RWZI2-J436C-3IJAM-LG6OT");
        }

        ///<inheritdoc/>
        public async Task<Document> ConvertAsync(string fileBinaryId, Guid newDocumentId, CancellationToken cancellationToken)
        {
            EnsureArg.IsNotEmptyOrWhiteSpace(fileBinaryId, nameof(fileBinaryId));
            logger.LogInformation($"Converting Pdf file with id {fileBinaryId} to Jpg");
            await using var fileStream = await fileRepository.GetAsync(fileBinaryId, cancellationToken);
            var convertedImages = await pdfToJpgConverter.ConvertAsync(fileStream, cancellationToken);
            var pages = new List<Page>();
            for (int i=0;i< convertedImages.Count;i++)
            {
                var image = convertedImages[i];
                var rawFile = new RawFile($"page_{fileBinaryId}_{i}", image.ImageStream);
                var addedPageId = await fileRepository.AddAsync(rawFile, cancellationToken);
                var page = new Page(Guid.NewGuid(), addedPageId, image.Width, image.Height);
                pages.Add(page);
            }
            var document = new Document(newDocumentId, $"doc_{fileBinaryId}", fileBinaryId, pages);
            await documentRepository.AddAsync(document, CancellationToken.None);
            return document;
        }
    }
}
