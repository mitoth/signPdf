using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using EnsureThat;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using RedactMyPdf.Core.Abstractions.Repositories;
using RedactMyPdf.Core.Models;
using RedactMyPdf.Repository.Mongo.Configuration;

namespace RedactMyPdf.Repository.Mongo
{
    public class FileRepository : IFileRepository
    {
        private readonly IMongoDatabase database;
        private readonly IMongoClient mongoClient;
        private readonly ILogger<FileRepository> logger;


        public FileRepository(IMongoClientConfiguration mongoClientConfiguration, ILogger<FileRepository> logger)
        {
            database = mongoClientConfiguration.GetDatabase();
            mongoClient = mongoClientConfiguration.GetClient();
            this.logger = logger;
        }

        public async Task<Stream> GetAsync(string id, CancellationToken cancellationToken)
        {
            logger.LogDebug($"Getting file with id [{id}]");
            EnsureArg.IsNotEmptyOrWhiteSpace(id, nameof(id));
            IGridFSBucket bucket = new GridFSBucket(database);
            ObjectId oid;
            try
            {
                oid = new ObjectId(id);
            }
            catch (Exception)
            {
                logger.LogError("Not supported id. It must be hexadecimal. adica cifre si litere pana la f parca.");
                throw;
            }

            await using var stream = await bucket.OpenDownloadStreamAsync(oid, cancellationToken: cancellationToken);
            var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Seek(0, SeekOrigin.Begin);
            return memoryStream;
        }

        public async Task<string> AddAsync(RawFile file, CancellationToken cancellationToken)
        {
            IGridFSBucket bucket = new GridFSBucket(database);

            return await AddFile(file.Name, file.Stream, bucket, cancellationToken);
        }

        private async Task<string> AddFile(string name, Stream file, IGridFSBucket bucket, CancellationToken cancellationToken)
        {
            logger.LogDebug($"Adding file with name [{name}]");
            // rewind the stream; this is mandatory for gridfs
            file.Seek(0, SeekOrigin.Begin);
            var id = await bucket.UploadFromStreamAsync(name, file, cancellationToken: cancellationToken);
            logger.LogDebug($"File with name [{name}] was added. File id [{id}]");
            return id.ToString();
        }
    }
}
