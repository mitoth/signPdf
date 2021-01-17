using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Tests.Core;

namespace RedactMyPdf.Repository.Tests
{
    [TestFixture]
    public class FileRepositoryTest : BaseRepositoryTest
    {
        private readonly IFileRepository fileRepository;


        public FileRepositoryTest()
        {
            var loggerMock = new Mock<ILogger<FileRepository>>();
            fileRepository = new FileRepository(MongoClientConfiguration, loggerMock.Object);
        }

        [Test]
        public async Task TestAddGetFile()
        {
            //arrange
            var testFileFolder = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            Directory.CreateDirectory(testFileFolder);
            var text = GetRandomText();
            var testFilePath = CreateTempFile(testFileFolder, text);
            var file = await File.ReadAllBytesAsync(testFilePath);

            //act
            await using var stream = new MemoryStream(file);
            var fileId = await fileRepository.AddAsync(new RawFile(Path.GetFileNameWithoutExtension(testFilePath), stream), CancellationToken.None);
            
            //assert
            await using var fileStream = await fileRepository.GetAsync(fileId, CancellationToken.None);
            var textReader = new StreamReader(fileStream);
            var textFromFile = await textReader.ReadToEndAsync();
            Assert.AreEqual(text, textFromFile);
            
        }

        private static string CreateTempFile(string testFileFolder, string text)
        {
            var fileName = GetFileName(testFileFolder);
            using var fs = new StreamWriter(fileName);
            fs.Write(text);
            return fileName;
        }

        private static string GetFileName(string testFileFolder)
        {
            return Path.Combine(testFileFolder, Path.GetRandomFileName());
        }

        private static string GetRandomText()
        {
            var random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, random.Next(2000, 15000))
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
