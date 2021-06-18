using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
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
                    var imagePage = doc.Pages.ElementAt(pageShapes.PageNumber - 1);
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
                            var widthRatio = pdfPage.Width / signature.PageWidth;
                            var heightRatio = pdfPage.Height /signature.PageHeight;
                            
                            var signatureWidth = signature.Width * widthRatio;
                            var signatureHeight = signature.Height * heightRatio;
                            var signatureX = signature.X * widthRatio;
                            var signatureY = signature.Y * heightRatio;
                            
                            canvas.FontSize = signature.FontSize * heightRatio;
                            // canvas.FontSize = 60;
                            
                            canvas.DrawString(signature.Text, 
                                new PdfRectangle(
                                    signatureX,
                                    signatureY,
                                    signatureWidth,
                                    signatureHeight), 
                                PdfTextAlign.Center,
                                PdfVerticalAlign.Center);  
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