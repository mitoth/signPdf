using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Repository.Mongo.Configuration;

namespace RedactMyPdf.Repository.Mongo
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly IMongoCollection<Document> documentsCollection;
        private readonly ILogger<DocumentRepository> logger;

        public DocumentRepository(IMongoClientConfiguration mongoClient, ILogger<DocumentRepository> logger)
        {
            documentsCollection = mongoClient.GetDatabase().GetCollection<Document>("documents");
            this.logger = logger;
        }

        public async Task<Document> GetAsync(Guid documentId, CancellationToken cancellationToken)
        {
            logger.LogDebug($"Getting document with id [{documentId}]");
            var documents = await documentsCollection.FindAsync(d => d.Id == documentId, cancellationToken: cancellationToken);
            return documents.FirstOrDefault();
        }

        public async Task<Guid> AddAsync(Document document, CancellationToken cancellationToken)
        {
            logger.LogDebug($"Adding document with id [{document.Id}]");
            await documentsCollection.InsertOneAsync(document, cancellationToken: cancellationToken);
            return document.Id;
        }
    }
}
