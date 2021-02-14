using System;
using System.Collections.Generic;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.Core.MessageQueue
{
    public class BurnShapesToPdfMessage
    {
        public readonly Guid DocumentId;
        public readonly IEnumerable<PageShapes> Shapes;

        public BurnShapesToPdfMessage(Guid documentId, IEnumerable<PageShapes> shapes)
        {
            DocumentId = documentId;
            Shapes = shapes;
        }
    }
}
