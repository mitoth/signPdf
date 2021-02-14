using System;

namespace RedactMyPdf.Core.Models
{
    public class Page
    {
        public readonly Guid Id;
        public readonly string FileBinaryId;

        /// <summary>
        /// Width in pixels of the image which was extract from the pdf page
        /// </summary>
        public readonly int ImageWidth;

        /// <summary>
        /// Height in pixels of the image which was extract from the pdf page
        /// </summary>
        public readonly int ImageHeight;

        /// <summary>
        /// Pdf page width in pixels (as determined by aspose)
        /// </summary>
        public readonly int PageWidth;

        /// <summary>
        /// Pdf page height in pixels (as determined by aspose)
        /// </summary>
        public readonly int PageHeight;


        public Page(Guid id, string fileBinaryId, int imageWidth, int imageHeight, int pageWidth, int pageHeight)
        {
            Id = id;
            FileBinaryId = fileBinaryId;
            ImageWidth = imageWidth;
            ImageHeight = imageHeight;
            PageWidth = pageWidth;
            PageHeight = pageHeight;
        }

        protected bool Equals(Page other)
        {
            return Id.Equals(other.Id) && FileBinaryId == other.FileBinaryId && ImageWidth == other.ImageWidth && ImageHeight == other.ImageHeight && PageWidth == other.PageWidth && PageHeight == other.PageHeight;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((Page) obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, FileBinaryId, ImageWidth, ImageHeight, PageWidth, PageHeight);
        }
    }
}