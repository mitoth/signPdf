using System;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.Core.MessageQueue
{
    public class BurnShapesToPdfMessage
    {
        public readonly Guid DocumentId;
        public readonly DocumentShapes DocumentShapes;

        public BurnShapesToPdfMessage(Guid documentId, DocumentShapes documentShapes)
        {
            DocumentId = documentId;
            DocumentShapes = documentShapes;
        }
    }
}
