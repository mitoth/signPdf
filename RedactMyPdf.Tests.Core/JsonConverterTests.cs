using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using NUnit.Framework;
using RedactMyPdf.Core.Models.Draw;
using RedactMyPdf.Core.Utils;

namespace RedactMyPdf.Tests.Core
{
    public class JsonConverterTests
    {
        [Test]
        public void TestShapesJsonConverter()
        {
            var shapes = new List<PageShapes>
            {
                new PageShapes(1, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                }),
                new PageShapes(2, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                }),
                new PageShapes(3, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                }),
                new PageShapes(4, new List<Shape>
                {
                    new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
                })
            };
            var documentShapes = new DocumentShapes(shapes);


            // ReSharper disable once MethodHasAsyncOverload
            var serializedShapes = JsonConvert.SerializeObject(documentShapes);

            var deserializedShapes = JsonConvert.DeserializeObject<DocumentShapes>(serializedShapes, new JsonSerializerSettings() { Converters = new List<JsonConverter> { new ShapeJsonConverter() } });

            Assert.NotNull(deserializedShapes);
            Assert.AreEqual(4, deserializedShapes.Pages.Count());
        }
    }
}
