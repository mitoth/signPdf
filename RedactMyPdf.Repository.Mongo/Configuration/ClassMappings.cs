using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
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
#pragma warning disable 618
                //https://jira.mongodb.org/browse/CSHARP-3179
            BsonDefaults.GuidRepresentationMode = GuidRepresentationMode.V3;
#pragma warning restore 618
            BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
            BsonClassMap.RegisterClassMap<Document>(cm =>
            {
                cm.MapIdMember(d => d.Id);
                cm.MapField(d => d.Name);
                cm.MapField(d => d.FileBinaryId);
                cm.MapField(d => d.Pages);
                cm.MapCreator(d => new Document(d.Id, d.Name, d.FileBinaryId, d.Pages));
            });
            BsonClassMap.RegisterClassMap<Page>(cm =>
            {
                cm.MapField(p => p.FileBinaryId);
                cm.MapField(p => p.Id);
                cm.MapField(p => p.Height);
                cm.MapField(p => p.Width);
                cm.MapCreator(p => new Page(p.Id, p.FileBinaryId, p.Width, p.Height));
            });
            BsonClassMap.RegisterClassMap<BurnedDocument>(cm =>
            {
                cm.MapIdMember(d => d.Id);
                cm.MapField(d => d.FileBinaryId);
                cm.MapField(d => d.OriginalDocumentId);
                cm.MapField(d => d.Shapes);
                cm.MapField(d => d.CreationDate);
                cm.MapCreator(d => new BurnedDocument(d.Id, d.OriginalDocumentId, d.FileBinaryId, d.Shapes));
            });
            BsonClassMap.RegisterClassMap<PageShapes>(cm =>
            {
                cm.MapField(d => d.Rectangles);
                cm.MapField(d => d.Signatures);
                cm.MapField(d => d.PageNumber);
                cm.MapCreator(d => new PageShapes(d.PageNumber, d.Rectangles, d.Signatures));
            });
            BsonClassMap.RegisterClassMap<Rectangle>(cm =>
            {
                cm.MapField(p => p.X);
                cm.MapField(p => p.Y);
                cm.MapField(p => p.Height);
                cm.MapField(p => p.Width);
                cm.MapField(p => p.BorderHtmlColorCode);
                cm.MapField(p => p.BorderLineWidth);
                cm.MapField(p => p.FillHtmlColorCode);
                cm.MapCreator(d => new Rectangle(d.X, d.Y, d.Width, d.Height, d.BorderHtmlColorCode, d.BorderLineWidth,
                    d.FillHtmlColorCode));
            });
            BsonClassMap.RegisterClassMap<Signature>(cm =>
            {
                cm.MapField(p => p.X);
                cm.MapField(p => p.Y);
                cm.MapField(p => p.Height);
                cm.MapField(p => p.Width);
                cm.MapField(p => p.PageHeight);
                cm.MapField(p => p.PageWidth);
                cm.MapField(p => p.ImageAsBase64);
                cm.MapCreator(d => new Signature(d.X, d.Y, d.Width, d.Height, d.ImageAsBase64, d.PageWidth, d.PageHeight));
            });
            mappingSet = true;
        }
    }
}
