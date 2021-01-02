using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using RedactMyPdf.Core.Models;

namespace RedactMyPdf.FileHandler
{
    public interface IPdfToJpgConverter
    {
        Task<List<ConvertedImage>> ConvertAsync(Stream document, CancellationToken cancellationToken);
    }
}
