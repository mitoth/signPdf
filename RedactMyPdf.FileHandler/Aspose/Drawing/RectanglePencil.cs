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

        public void Draw(Page asposePage, Core.Models.Page documentPage)
        {
            SetPageMargins(asposePage);

            var widthInPoints = (float)Math.Round(asposePage.Rect.Width);
            var heightInPoints = (float)Math.Round(asposePage.Rect.Height);

            var canvas = new Graph(widthInPoints, heightInPoints);
            if (asposePage.Paragraphs.FirstOrDefault(g =>
                g is Graph graph && Math.Abs(graph.Width - widthInPoints) < 0.1 && Math.Abs(graph.Height - heightInPoints) < 0.1) is Graph existingCanvas)
            {
                canvas = existingCanvas;
            }
            else
            {
                asposePage.Paragraphs.Add(canvas);   
            }
            var c = ColorTranslator.FromHtml(rectangle.BorderHtmlColorCode);

            var widthRatio = (float) (asposePage.Rect.Width / documentPage.Width);
            var heightRatio = (float) (asposePage.Rect.Height / documentPage.Height);
            
            //HACK - In aspose X = 0 is in the bottom left corner of the page like in Geometry;
            //however, most of the UI tools consider x=0 to be the top left corner; hack needed to adapt to this
            var translatedY = documentPage.Height - rectangle.Axis.Y - rectangle.Height;

            var rect = new AsposePdf.Drawing.Rectangle(
                rectangle.Axis.X * widthRatio,
                translatedY * heightRatio, 
                rectangle.Width * widthRatio,
                rectangle.Height * heightRatio)
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
