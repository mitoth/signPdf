using System;
using System.Collections.Generic;
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
    public class DocumentRepositoryTests : BaseRepositoryTest
    {
        private readonly IDocumentRepository documentRepository;

        public DocumentRepositoryTests()
        {
            var loggerMock = new Mock<ILogger<DocumentRepository>>();
            documentRepository = new DocumentRepository(MongoClientConfiguration, loggerMock.Object);
        }

        [Test]
        public async Task AddGetDocumentTest()
        {
            var document = new Document(Guid.NewGuid(), "test", Guid.NewGuid().ToString(), new List<Page> {new Page(Guid.NewGuid(), "idupaginii", 4, 6, 2, 4)});
            var documentId = await documentRepository.AddAsync(document, CancellationToken.None);
            Assert.AreEqual(documentId, document.Id);
            var documentFromDatabase = await documentRepository.GetAsync(documentId, CancellationToken.None);
            Assert.AreEqual(document, documentFromDatabase);
        }
    }
}
