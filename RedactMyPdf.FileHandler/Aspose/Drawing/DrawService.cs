using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Aspose.Pdf;
using RedactMyPdf.Core.Models.Draw;
using Rectangle = RedactMyPdf.Core.Models.Draw.Rectangle;

namespace RedactMyPdf.FileHandler.Aspose.Drawing
{
    public class DrawService : IDrawService
    {
        public async Task<Stream> DrawAsync(Stream inputDocumentStream, IEnumerable<PageShapes> shapes, CancellationToken cancellationToken)
        {
            using var document = new Document(inputDocumentStream);
            foreach (var pageShape in shapes)
            {
                await DrawToPage(document.Pages[pageShape.PageNumber], pageShape, cancellationToken);
            }
            var drawnDocument = new MemoryStream();
            document.Save(drawnDocument);
            drawnDocument.Position = 0;
            return drawnDocument;
        }

        private static async Task DrawToPage(Page page, PageShapes pageShapes, CancellationToken cancellationToken)
        {
            await Task.Run(() =>
            {
                foreach (var shape in pageShapes.Shapes)
                {
                    var pencil = GetPencil(shape);
                    pencil.Draw(page);
                }
            }, cancellationToken);
        }

        private static IPencil GetPencil<T>(T shape) where T : Shape
        {
            return shape switch
            {
                Rectangle rectangle => new RectanglePencil(rectangle),
                _ => throw new NotSupportedException()
            };
        }
    }
}
