using System.IO;

namespace RedactMyPdf.Core.Models
{
    public class ConvertedImage
    {
        public Stream ImageStream { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }
}
