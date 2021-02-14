using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.FileHandler.Services.Drawing
{
    public class BurnDocumentService : IBurnDocumentService
    {
        private readonly IDocumentRepository documentRepository;
        private readonly IBurnedDocumentRepository burnedDocumentRepository;
        private readonly IFileRepository fileRepository;
        private readonly IDrawService drawService;

        public BurnDocumentService(IDocumentRepository documentRepository, IFileRepository fileRepository, IDrawService drawService, IBurnedDocumentRepository burnedDocumentRepository)
        {
            this.documentRepository = documentRepository;
            this.fileRepository = fileRepository;
            this.drawService = drawService;
            this.burnedDocumentRepository = burnedDocumentRepository;
        }

        public async Task BurnShapes(Guid documentId, List<PageShapes> shapes, CancellationToken cancellationToken)
        {
            var document = await documentRepository.GetAsync(documentId, cancellationToken);
            await using var documentStream = await fileRepository.GetAsync(document.FileBinaryId, cancellationToken);
            await using var burnedFileStream = await drawService.DrawAsync(documentStream, shapes, cancellationToken);
            var storedFileId = await fileRepository.AddAsync(new RawFile($"burned_{documentId}", burnedFileStream), cancellationToken);
            var burnedDocument = new BurnedDocument(Guid.NewGuid(), documentId, storedFileId, shapes);
            await burnedDocumentRepository.AddAsync(burnedDocument, cancellationToken);
        }
    }
}
