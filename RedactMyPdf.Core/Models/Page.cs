using System;

namespace RedactMyPdf.Core.Models
{
    public class Page
    {
        public readonly Guid Id;
        public readonly string FileBinaryId;
        public readonly int Height;
        public readonly int Width;

        public Page(Guid id, string fileBinaryId, int height, int width)
        {
            Id = id;
            FileBinaryId = fileBinaryId;
            Height = height;
            Width = width;
        }

        protected bool Equals(Page other)
        {
            return Id.Equals(other.Id) && FileBinaryId == other.FileBinaryId && Height == other.Height && Width == other.Width;
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
            unchecked
            {
                return (Id.GetHashCode() + Height + Width * 397) ^ (FileBinaryId != null ? FileBinaryId.GetHashCode() : 0);
            }
        }

        public override string ToString()
        {
            return $"{nameof(Id)}: {Id}, {nameof(FileBinaryId)}: {FileBinaryId}, {nameof(Height)}: {Height}, {nameof(Width)}: {Width}";
        }
    }
}