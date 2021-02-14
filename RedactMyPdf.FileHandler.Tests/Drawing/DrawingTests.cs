using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;
using RedactMyPdf.FileHandler.Aspose.Drawing;
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

            var drawService = new DrawService();
            var fileBinary = await File.ReadAllBytesAsync(inputPdf.FullName);
            var rectangle = new Rectangle(new Axis(0, 0), 100, 100, "#FFC0CB", 5, "#3377FF");
            var textBox = new TextBox(new Axis(150, 150), "scris de mine", 14, "TimesNewRoman", "#3377FF", "#FFC0CB");
            var pageShapesList = new List<PageShapes>();
            for (var i = 1; i <= 1; i++)
            {
                pageShapesList.Add(new PageShapes(i,
                    new List<Shape>
                    {
                        rectangle,
                        textBox,
                        new Rectangle(new Axis(100, 100), 300, 300, "#FFC0CB", 5, "#3377FF")
                    }));
            }

            await using var stream = new MemoryStream(fileBinary);
            await using var stampedStream = await drawService.DrawAsync(stream, new Document(new Guid(), "","", new List<Page>()),  pageShapesList, CancellationToken.None);
            await using var testFileStream = File.Create(Path.Combine(OutputFolderPath, "test1.pdf"));
            stampedStream.Seek(0, SeekOrigin.Begin);
            await stampedStream.CopyToAsync(testFileStream);
            Assert.IsTrue(await FileUtil.IsJpegFileSignature(testFileStream));
        }
    }
}