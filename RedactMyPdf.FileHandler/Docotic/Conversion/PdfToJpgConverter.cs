using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using BitMiracle.Docotic.Pdf;
using RedactMyPdf.Core.Models;

namespace RedactMyPdf.FileHandler.Docotic.Conversion
{
    public class PdfToJpgConverter : IPdfToJpgConverter
    {
        public async Task<List<ConvertedImage>> ConvertAsync(Stream document, CancellationToken cancellationToken)
        {
            return await Task.Run(() =>
            {
                var convertedImages = new List<ConvertedImage>();
                using var pdf = new PdfDocument(document);
                foreach (var page in pdf.Pages)
                {
                    var imageStream = new MemoryStream();
                    PdfDrawOptions options = PdfDrawOptions.Create();
                    options.BackgroundColor = new PdfRgbColor(255, 255, 255);
                    options.HorizontalResolution = 250;
                    options.VerticalResolution = 250;
                    options.Compression = ImageCompressionOptions.CreateJpeg();
                    page.Save(imageStream, options);
                    imageStream.Seek(0, SeekOrigin.Begin);
                    var img = new Bitmap(imageStream);

                    var convertedImage = new ConvertedImage()
                    {
                        ImageStream = imageStream,
                        Height = img.Height,
                        Width = img.Width
                    };
                    convertedImages.Add(convertedImage);
                }

                return convertedImages;
            }, cancellationToken);
        }
    }
}