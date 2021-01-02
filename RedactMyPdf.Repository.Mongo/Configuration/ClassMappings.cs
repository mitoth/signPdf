using MongoDB.Bson.Serialization;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.Repository.Mongo.Configuration
{
    public static class ClassMappings
    {
        private static bool mappingSet;

        public static void SetMappings()
        {
            if (mappingSet) return;
            BsonClassMap.RegisterClassMap<Document>(cm =>
            {
                cm.MapIdMember(d => d.Id).SetElementName("_id");
                cm.MapField(d => d.Name);
                cm.MapField(d => d.FileBinaryId);
                cm.MapField(d => d.Pages);
                cm.MapCreator(d => new Document(d.Id, d.Name, d.FileBinaryId, d.Pages));
            });
            BsonClassMap.RegisterClassMap<Page>(cm =>
            {
                cm.MapField(p => p.FileBinaryId);
                cm.MapField(p => p.Id);
                cm.MapField(p => p.Width);
                cm.MapField(p => p.Height);
                cm.MapCreator(p => new Page(p.Id, p.FileBinaryId, p.Height, p.Width));
            });
            BsonClassMap.RegisterClassMap<BurnedDocument>(cm =>
            {
                cm.MapIdMember(d => d.Id).SetElementName("_id");
                cm.MapField(d => d.FileBinaryId);
                cm.MapField(d => d.OriginalDocumentId);
                cm.MapField(d => d.DocumentShapes);
                cm.MapField(d => d.CreationDate);
                cm.MapCreator(d => new BurnedDocument(d.Id, d.OriginalDocumentId, d.FileBinaryId, d.DocumentShapes));
            });
            BsonClassMap.RegisterClassMap<DocumentShapes>(cm =>
            {
                cm.MapField(d => d.Pages);
                cm.MapCreator(d => new DocumentShapes(d.Pages));
            });
            BsonClassMap.RegisterClassMap<PageShapes>(cm =>
            {
                cm.MapField(d => d.Shapes);
                cm.MapField(d => d.PageNumber);
                cm.MapCreator(d => new PageShapes(d.PageNumber, d.Shapes));
            });
            BsonClassMap.RegisterClassMap<Shape>(cm =>
            {
                cm.MapField(p => p.Axis);
                cm.SetIsRootClass(true);
            });
            BsonClassMap.RegisterClassMap<Rectangle>(cm =>
            {
                cm.MapField(p => p.Height);
                cm.MapField(p => p.Width);
                cm.MapField(p => p.BorderHtmlColorCode);
                cm.MapField(p => p.BorderLineWidth);
                cm.MapField(p => p.FillHtmlColorCode);
                cm.MapCreator(d => new Rectangle(d.Axis, d.Width, d.Height, d.BorderHtmlColorCode, d.BorderLineWidth,
                    d.FillHtmlColorCode));
            });
            BsonClassMap.RegisterClassMap<Axis>(cm =>
            {
                cm.MapField(p => p.Y);
                cm.MapField(p => p.X);
                cm.MapCreator(d => new Axis(d.X, d.Y));
            });
            mappingSet = true;
        }
    }
}
