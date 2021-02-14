using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.FileHandler
{
    public interface IDrawService
    {
        Task<Stream> DrawAsync(Stream inputDocumentStream, IEnumerable<PageShapes> shapes, CancellationToken cancellationToken);
    }
}
