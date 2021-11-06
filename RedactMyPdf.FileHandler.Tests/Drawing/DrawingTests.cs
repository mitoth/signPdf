using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;
using RedactMyPdf.FileHandler.Docotic.Conversion;
using RedactMyPdf.FileHandler.Docotic.Drawing;
using RedactMyPdf.FileHandler.Tests.Util;

namespace RedactMyPdf.FileHandler.Tests.Drawing
{
    public class DrawingTests
    {
        private static readonly string OutputFolderPath = $"{Assembly.GetExecutingAssembly().Location}\\..\\..\\..\\PdfTestFiles\\TestOutput";

        /// <summary>
        /// Creates the output directory
        /// </summary>
        [OneTimeSetUp]
        public void Initialize()
        {
            if (Directory.Exists(OutputFolderPath))
            {
                return;
            }

            // create the output test directory
            Directory.CreateDirectory(OutputFolderPath);
        }
        
        [Test]
        public async Task TestDrawSignature()
        {
            var testFilesParentDirectory = new DirectoryInfo($"{Assembly.GetExecutingAssembly().Location}").Parent
                ?.Parent?.Parent?.Parent;
            var inputPdfFilePath = $"{testFilesParentDirectory}\\PdfTestFiles\\talisman.pdf";
            var inputPdf = new FileInfo(inputPdfFilePath);

            var drawService = new ShapesBurner();
            var fileBinary = await File.ReadAllBytesAsync(inputPdf.FullName);
            var imageAsBase64 = "data:image/png;base64,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";
            var signature = new Signature(0, 500, 100, 100, imageAsBase64, 1000, 1000);
            var pageShapesList = new List<PageShapes>();
            pageShapesList.Add(new PageShapes(1, new List<Rectangle>(), new List<Signature>()
            {
                signature
            }));

            await using var stream = new MemoryStream(fileBinary);
            await using var stampedStream = 
                await drawService.BurnAsync(stream, new Document(new Guid(), "","", new List<Page>()),
                    pageShapesList, CancellationToken.None);
            await using var testFileStream = File.Create(Path.Combine(OutputFolderPath, "test1.pdf"));
            stampedStream.Seek(0, SeekOrigin.Begin);
            await stampedStream.CopyToAsync(testFileStream);
            Assert.IsTrue(await FileUtil.IsJpegFileSignature(testFileStream));
        }
    }
}