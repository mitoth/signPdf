using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RedactMyPdf.Core.Models.Draw
{
    /// <summary>
    /// Represents a page with its shapes
    /// </summary>
    public class PageShapes
    {
        public readonly int PageNumber;
        public readonly IEnumerable<Rectangle> Rectangles;
        public readonly IEnumerable<Signature> Signatures;

        public PageShapes(int pageNumber, IEnumerable<Rectangle> rectangles, IEnumerable<Signature> signatures)
        {
            PageNumber = pageNumber;
            Rectangles = rectangles;
            Signatures = signatures;
        }

        protected bool Equals(PageShapes other)
        {
            return PageNumber == other.PageNumber && Rectangles.SequenceEqual(other.Rectangles) && 
                   Signatures.SequenceEqual(other.Signatures);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((PageShapes) obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(PageNumber, Rectangles, Signatures);
        }

        public override string ToString()
        {
            var stringBuilder = new StringBuilder($"--Page number: {PageNumber}");

            foreach (var rectangle in Rectangles)
            {
                stringBuilder.Append($"{rectangle}");
            }

            foreach (var signature in Signatures)
            {
                stringBuilder.Append($"{signature}");
            }
            return stringBuilder.ToString();
        }
    }
}
