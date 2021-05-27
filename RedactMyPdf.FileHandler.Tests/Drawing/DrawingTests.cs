using System.IO;
using System.Reflection;
using NUnit.Framework;

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
    }
}