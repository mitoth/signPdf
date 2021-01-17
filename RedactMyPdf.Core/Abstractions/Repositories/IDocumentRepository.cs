using System;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models;

namespace RedactMyPdf.Core.Abstractions.Repositories
{
    public interface IDocumentRepository
    {
        Task<Document> GetAsync(Guid documentId, CancellationToken cancellationToken);
        Task<Guid> AddAsync(Document document, CancellationToken cancellationToken);
    }
}