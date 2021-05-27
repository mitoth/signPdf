﻿using System.Collections.Generic;
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
                new Rectangle(new Axis(100, 100), 200, 200, "#FF5733", 2, "#FF5733")
            }, new List<Signature>() {new Signature(new Axis(100, 100), 200, 300, "Mihai Toth", "Colibri")});
        }
    }
}
