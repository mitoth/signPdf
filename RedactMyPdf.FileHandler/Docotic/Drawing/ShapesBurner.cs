using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using BitMiracle.Docotic.Pdf;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.FileHandler.Docotic.Drawing
{
    public class ShapesBurner : IShapesBurner
    {
        public async Task<Stream> BurnAsync(Stream inputDocumentStream, Document doc, IEnumerable<PageShapes> shapes,
            CancellationToken cancellationToken)
        {
            return await Task.Run(() =>
            {
                if (shapes == null || !shapes.Any())
                {
                    return inputDocumentStream;
                }

                using var pdf = new PdfDocument(inputDocumentStream);

                foreach (var pageShapes in shapes)
                {
                    if (pageShapes.PageNumber > pdf.PageCount)
                    {
                        throw new Exception(
                            $"Pagina {pageShapes.PageNumber} nu-i buna. Documentul are doar {pdf.PageCount} pagini");
                    }

                    var pdfPage = pdf.Pages[pageShapes.PageNumber - 1];
                    PdfCanvas canvas = pdfPage.Canvas;

                    var assembly = typeof(ShapesBurner).GetTypeInfo().Assembly;
                    Stream fontStream =
                        assembly.GetManifestResourceStream("RedactMyPdf.FileHandler._fonts.GreatVibes-Regular.ttf");
                    
                    PdfFont fontFromFile = pdf.AddFont(fontStream);
                    canvas.Font = fontFromFile;
                    if (pageShapes.Signatures.Any())
                    {
                        foreach (var signature in pageShapes.Signatures)
                        {
                            //the ratio between what the user sees and the actual pdf width
                            var widthRatio = Math.Floor(pdfPage.Width) / Math.Floor(signature.PageWidth);
                            var heightRatio = Math.Floor(pdfPage.Height) / Math.Floor(signature.PageHeight);
                            
                            var signatureWidth = Math.Floor(signature.Width) * widthRatio;
                            var signatureHeight = Math.Floor(signature.Height) * heightRatio;
                            var signatureX = signature.X * widthRatio;
                            var signatureY = signature.Y * heightRatio;

                            var base64Data = Regex.Match(signature.ImageAsBase64, @"data:image/(?<type>.+?),(?<data>.+)").Groups["data"].Value;
                            var image = Convert.FromBase64String(base64Data);
                            var pdfImage = pdf.AddImage(image);
                            canvas.DrawImage(
                                pdfImage, 
                                Math.Round(signatureX),
                                Math.Floor(signatureY),
                                Math.Floor(signatureWidth),
                                Math.Floor(signatureHeight), 0);
                        }
                    }
                }
                
                var savedDocument = new MemoryStream();
                pdf.Save(savedDocument);

                savedDocument.Seek(0, SeekOrigin.Begin);
                return savedDocument;
            }, cancellationToken);
        }
    }
}