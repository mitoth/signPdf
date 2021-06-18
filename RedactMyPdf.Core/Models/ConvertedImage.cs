using System.IO;

namespace RedactMyPdf.Core.Models
{
    public class ConvertedImage
    {
        /// <summary>
        /// The image stream
        /// </summary>
        public Stream ImageStream { get; set; }

        /// <summary>
        /// Width in pixels of the image which was extract from the pdf page
        /// </summary>
        public int Width { get; set; }

        /// <summary>
        /// Height in pixels of the image which was extract from the pdf page
        /// </summary>
        public int Height { get; set; }
    }
}
