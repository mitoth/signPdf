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
        public readonly int Width;

        /// <summary>
        /// Height in pixels of the image which was extract from the pdf page
        /// </summary>
        public readonly int Height;


        public Page(Guid id, string fileBinaryId, int width, int height)
        {
            Id = id;
            FileBinaryId = fileBinaryId;
            Width = width;
            Height = height;
        }

        protected bool Equals(Page other)
        {
            return Id.Equals(other.Id) && FileBinaryId == other.FileBinaryId && Width == other.Width && Height == other.Height;
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
            return HashCode.Combine(Id, FileBinaryId, Width, Height);
        }
    }
}