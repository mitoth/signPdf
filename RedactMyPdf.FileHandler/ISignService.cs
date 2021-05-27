using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.FileHandler
{
    public interface ISignService
    {
        Task<Stream> SignAsync(Stream inputDocumentStream,Core.Models.Document doc, IEnumerable<PageShapes> shapes, CancellationToken cancellationToken);

    }
}