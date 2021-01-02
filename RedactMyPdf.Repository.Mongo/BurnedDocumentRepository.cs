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
    public class BurnedDocumentRepository : IBurnedDocumentRepository
    {
        private readonly IMongoCollection<BurnedDocument> documentsCollection;
        private readonly ILogger<BurnedDocumentRepository> logger;
        public BurnedDocumentRepository(IMongoClientConfiguration mongoClient, ILogger<BurnedDocumentRepository> logger)
        {
            documentsCollection = mongoClient.GetDatabase().GetCollection<BurnedDocument>("burned_documents");
            this.logger = logger;
        }

        public async Task<BurnedDocument> GetAsync(Guid originalDocumentId, CancellationToken cancellationToken)
        {
            //TODO - Add index after OriginalDocumentId; make sure to return the latest based on CreationDate or implement some sort of version
            logger.LogDebug($"Getting burned document with id [{originalDocumentId}]");
            var documents = await documentsCollection.FindAsync(d => d.OriginalDocumentId == originalDocumentId, new FindOptions<BurnedDocument, BurnedDocument>()
            {
                Sort = Builders<BurnedDocument>.Sort.Descending(d => d.CreationDate)
            }, cancellationToken: cancellationToken);
            return documents.FirstOrDefault();
        }

        public async Task AddAsync(BurnedDocument document, CancellationToken cancellationToken)
        {
            logger.LogDebug($"Adding burned document for documentId [{document.OriginalDocumentId}] and burnedDocumentId [{document.Id}]");
            await documentsCollection.InsertOneAsync(document, cancellationToken: cancellationToken);
        }
    }
}
