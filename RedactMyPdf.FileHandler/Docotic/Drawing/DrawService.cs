using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.FileHandler.Docotic.Drawing
{
    public class DrawService : IDrawService
    {
        public Task<Stream> DrawAsync(Stream inputDocumentStream, Document doc, IEnumerable<PageShapes> shapes, CancellationToken cancellationToken)
        {
            throw new System.NotImplementedException();
        }
    }
}