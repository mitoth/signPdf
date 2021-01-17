using System;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models;

namespace RedactMyPdf.FileHandler.Services.Conversion
{
    public interface IConvertPdfToJpgService
    {
        /// <summary>
        /// Converts each document page to jpg and stores everything in the database. The stored document will have the provided id newDocumentGuid.
        /// </summary>
        /// <param name="fileBinaryId"></param>
        /// <param name="newDocumentId"> The Id which will be used to store the document that will be created after conversion.</param>
        /// <param name="cancellationToken"></param>
        /// <returns>A Document which has information about the pages</returns>
        Task<Document> ConvertAsync(string fileBinaryId, Guid newDocumentId, CancellationToken cancellationToken);
    }
}
