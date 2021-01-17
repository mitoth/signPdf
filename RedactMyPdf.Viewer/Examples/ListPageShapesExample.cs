using System.Collections.Generic;
using RedactMyPdf.Core.Models.Draw;
using Swashbuckle.AspNetCore.Filters;

namespace RedactMyPdf.Viewer.Examples
{
    public class ListPageShapesExample : IExamplesProvider<PageShapes>
    {
        public PageShapes GetExamples()
        {
            return new PageShapes(1, new List<Shape>
            {
                new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
            });
        }
    }
}
