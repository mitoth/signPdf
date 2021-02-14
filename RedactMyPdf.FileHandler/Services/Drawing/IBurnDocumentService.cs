using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.FileHandler.Services.Drawing
{
    public interface IBurnDocumentService
    {

        /// <summary>
        /// Burns shapes to a document
        /// </summary>
        /// <param name="documentId"></param>
        /// <param name="shapes"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        Task BurnShapes(Guid documentId, List<PageShapes> shapes,
            CancellationToken cancellationToken);
    }
}
