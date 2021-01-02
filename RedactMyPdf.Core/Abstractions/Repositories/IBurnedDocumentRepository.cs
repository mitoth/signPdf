using System;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models;

namespace RedactMyPdf.Core.Abstractions.Repositories
{
    public interface IBurnedDocumentRepository
    {
        /// <summary>
        /// Gets the latest burned version of the document with Id originalDocumentId
        /// </summary>
        /// <param name="originalDocumentId"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        Task<BurnedDocument> GetAsync(Guid originalDocumentId, CancellationToken cancellationToken);
        Task AddAsync(BurnedDocument document, CancellationToken cancellationToken);
    }
}
