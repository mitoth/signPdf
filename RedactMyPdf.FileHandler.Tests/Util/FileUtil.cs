using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RedactMyPdf.FileHandler.Tests.Util
{
    public class FileUtil
    {
        public static async Task<bool> IsJpegFileSignature(Stream fileStream)
        {
            //https://docs.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-3.1#validation

            await using var testStream = new MemoryStream();
            await fileStream.CopyToAsync(testStream);
            testStream.Position = 0;

            using var reader = new BinaryReader(testStream);
            var pdfFileSignature = new List<byte[]>
            {
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 }
            };
            var headerBytes = reader.ReadBytes(pdfFileSignature.Count);

            return !pdfFileSignature.Any(signature =>
                headerBytes.Take(signature.Length).SequenceEqual(signature));
        }
    }
}
