using System.IO;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using RedactMyPdf.FileHandler.Docotic.Conversion;
using RedactMyPdf.FileHandler.Tests.Util;

namespace RedactMyPdf.FileHandler.Tests.Conversion
{
    public class ConversionTests
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
        public async Task TestConvertPdfToIndividualJpegFile()
        {
            var testFilesParentDirectory = new DirectoryInfo($"{Assembly.GetExecutingAssembly().Location}").Parent
                ?.Parent?.Parent?.Parent;
            var inputPdfFilePath = $"{testFilesParentDirectory}\\PdfTestFiles\\test4PagesDocument.pdf";
            var inputPdf = new FileInfo(inputPdfFilePath);

            var fileBinary = await File.ReadAllBytesAsync(inputPdf.FullName);
            await using var stream = new MemoryStream(fileBinary);

            var conversionService = new PdfToJpgConverter();
            var jpegFiles = await conversionService.ConvertAsync(stream, CancellationToken.None);
            foreach (var jpegFile in jpegFiles)
            {
                await using var testFileStream = File.Create(Path.Combine(OutputFolderPath, $"jpegfile{jpegFiles.IndexOf(jpegFile) + 1}.jpeg"));
                jpegFile.ImageStream.Seek(0, SeekOrigin.Begin);
                await jpegFile.ImageStream.CopyToAsync(testFileStream);
                Assert.IsTrue(await FileUtil.IsJpegFileSignature(testFileStream));
            }
        }
    }
}
