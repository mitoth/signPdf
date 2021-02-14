using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Aspose.Pdf.Devices;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Utils;
using Document = Aspose.Pdf.Document;
using Page = Aspose.Pdf.Page;

namespace RedactMyPdf.FileHandler.Aspose.Conversion
{
    public class PdfToJpgConverter : IPdfToJpgConverter
    {
        public async Task<List<ConvertedImage>> ConvertAsync(Stream document, CancellationToken cancellationToken)
        {
            var pdfDocument = new Document(document);
            var tasks = pdfDocument.Pages.Select(p => ConvertPage(p, cancellationToken)).ToArray();
            var result = await Task.WhenAll(tasks);

            return result.ToList();
        }

        private static async Task<ConvertedImage> ConvertPage(Page page, CancellationToken cancellationToken)
        {
            return await Task.Run(() =>
            {
                var imageStream = new MemoryStream();

                // Create JPEG device with default resolution and maximum quality
                // JpegDevice jpegDevice = new JpegDevice(Convert.ToInt32(pageWidthInPixels), Convert.ToInt32(pageHeightInPixels));
                JpegDevice jpegDevice = new JpegDevice();

                // Convert a particular page and save the image to stream
                jpegDevice.Process(page, imageStream);
                imageStream.Seek(0, SeekOrigin.Begin);

                var img = new Bitmap(imageStream);
                
                return new ConvertedImage
                {
                    ImageStream = imageStream,
                    Height = img.Height,
                    Width = img.Width
                };
            }, cancellationToken);
        }
    }
}
