using System;
using System.Drawing;
using System.Linq;
using Aspose.Pdf;
using Aspose.Pdf.Drawing;
using RedactMyPdf.Core.Utils;
using AsposePdf = Aspose.Pdf;
using Rectangle = RedactMyPdf.Core.Models.Draw.Rectangle;


namespace RedactMyPdf.FileHandler.Aspose.Drawing
{
    public class RectanglePencil : IPencil
    {
        private readonly Rectangle rectangle;

        public RectanglePencil(Rectangle rectangle)
        {
            this.rectangle = rectangle;
        }

        public void Draw(Page page)
        {
            SetPageMargins(page);

            var widthInPoints = (float)Math.Truncate(page.Rect.Width);
            var heightInPoints = (float)Math.Truncate(page.Rect.Height);

            
            var canvas = new Graph(widthInPoints, heightInPoints);
            if (page.Paragraphs.FirstOrDefault(g =>
                g is Graph graph && Math.Abs(graph.Width - widthInPoints) < 0.1 && Math.Abs(graph.Height - heightInPoints) < 0.1) is Graph existingCanvas)
            {
                canvas = existingCanvas;
            }
            else
            {
                page.Paragraphs.Add(canvas);   
            }
            var c = ColorTranslator.FromHtml(rectangle.BorderHtmlColorCode);
            
            //HACK - In aspose X = 0 is in the bottom left corner of the page like in Geometry;
            //however, most of the UI tools consider x=0 to be the top left corner; hack needed to adapt to this
            var yInPoints = heightInPoints - UnitsOfMeasure.ToPoints(rectangle.Axis.Y) - UnitsOfMeasure.ToPoints(rectangle.Height);
            
            var rect = new AsposePdf.Drawing.Rectangle(
                UnitsOfMeasure.ToPoints(rectangle.Axis.X), 
                yInPoints, 
                UnitsOfMeasure.ToPoints(rectangle.Width),
                UnitsOfMeasure.ToPoints(rectangle.Height))
            {
                GraphInfo =
                {
                    Color = AsposePdf.Color.FromRgb(c)
                }
            };
            if (rectangle.BorderLineWidth.HasValue) rect.GraphInfo.LineWidth = rectangle.BorderLineWidth.Value;

            if (!string.IsNullOrWhiteSpace(rectangle.FillHtmlColorCode))
                rect.GraphInfo.FillColor =
                    AsposePdf.Color.FromRgb(ColorTranslator.FromHtml(rectangle.FillHtmlColorCode));
            
            canvas.Shapes.Add(rect);
        }

        private void SetPageMargins(Page page)
        {
            page.PageInfo.Margin.Left = page.PageInfo.Margin.Right
                = page.PageInfo.Margin.Bottom = page.PageInfo.Margin.Top = 0;
        }
    }
}
