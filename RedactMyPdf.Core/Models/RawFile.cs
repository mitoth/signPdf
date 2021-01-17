using System.IO;

namespace RedactMyPdf.Core.Models
{
    public class RawFile
    {
        public readonly string Name;
        public readonly Stream Stream;

        public RawFile(string name, Stream stream)
        {
            Name = name;
            Stream = stream;
        }
    }
}
