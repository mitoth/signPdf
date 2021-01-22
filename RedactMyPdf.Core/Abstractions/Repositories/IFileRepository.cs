using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using RawFile = RedactMyPdf.Core.Models.RawFile;

namespace RedactMyPdf.Core.Abstractions.Repositories
{
    public interface IFileRepository
    {
        /// <summary>
        /// Get a file stream
        /// </summary>
        /// <param name="id">The id of the file</param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        Task<Stream> GetAsync(string id, CancellationToken cancellationToken);

        /// <summary>
        /// Add a file stream
        /// </summary>
        /// <param name="name">File name</param>
        /// <param name="file">File stream</param>
        /// <param name="cancellationToken"></param>
        /// <returns>The id of the inserted file</returns>
        Task<string> AddAsync(RawFile file, CancellationToken cancellationToken);
    }
}