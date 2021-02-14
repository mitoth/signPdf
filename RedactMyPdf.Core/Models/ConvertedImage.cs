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
        public int ImageWidth { get; set; }
        /// <summary>
        /// Height in pixels of the image which was extract from the pdf page
        /// </summary>
        public int ImageHeight { get; set; }
        
        /// <summary>
        /// Pdf page width in pixels (as determined by aspose)
        /// </summary>
        public int PageWidth { get; set; }
        
        /// <summary>
        /// Pdf page height in pixels (as determined by aspose)
        /// </summary>
        public int PageHeight { get; set; }
    }
}
