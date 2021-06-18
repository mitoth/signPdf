using System.Collections.Generic;
using RedactMyPdf.Core.Models.Draw;
using Swashbuckle.AspNetCore.Filters;

namespace RedactMyPdf.Viewer.Examples
{
    public class ListPageShapesExample : IExamplesProvider<PageShapes>
    {
        public PageShapes GetExamples()
        {
            return new PageShapes(1, new List<Rectangle>
            {
                new Rectangle(100, 100, 200, 200, "#FF5733", 2, "#FF5733")
            }, new List<Signature>() {new Signature(100, 100, 200, 300, "Mihai Toth", 30, 1000, 1000)});
        }
    }
}
