using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
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
        public async Task TestDrawRectangle()
        {
            var testFilesParentDirectory = new DirectoryInfo($"{Assembly.GetExecutingAssembly().Location}").Parent
                ?.Parent?.Parent?.Parent;
            var inputPdfFilePath = $"{testFilesParentDirectory}\\PdfTestFiles\\talisman.pdf";
            var inputPdf = new FileInfo(inputPdfFilePath);

            var drawService = new ShapesBurner();
            var fileBinary = await File.ReadAllBytesAsync(inputPdf.FullName);
            var signature = new Signature(0, 500, 100, 100, "semnatura", 30, 1000, 1000);
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