using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Core.Models.Draw;
using RedactMyPdf.Repository.Mongo;
using RedactMyPdf.Tests.Core;

namespace RedactMyPdf.Repository.Tests
{
    public class BurnedDocumentRepositoryTests : BaseRepositoryTest
    {
        private readonly IBurnedDocumentRepository burnedDocumentRepository;

        public BurnedDocumentRepositoryTests()
        {
            var loggerMock = new Mock<ILogger<BurnedDocumentRepository>>();
            burnedDocumentRepository = new BurnedDocumentRepository(MongoClientConfiguration, loggerMock.Object);
        }

        [Test]
        public async Task AddGetBurnedDocumentTest()
        {
            var shapes = new List<PageShapes>
            {
                new PageShapes(1, new List<Rectangle>
                {
                    new Rectangle(2, 2, 2, 2, "some", 2, "other")
                }, new List<Signature>(){new Signature(2,3, 4, 5, "Mihai Toth", 1000, 1000)})
            };

            var documentId = Guid.NewGuid();
            var addedDocument = new BurnedDocument(Guid.NewGuid(), documentId, "id", shapes);
            await burnedDocumentRepository.AddAsync(addedDocument, CancellationToken.None);
            var retrievedDocument = await burnedDocumentRepository.GetAsync(documentId, CancellationToken.None);
            Assert.AreEqual(addedDocument, retrievedDocument);
        }
    }
}
