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
        public readonly IEnumerable<Shape> Shapes;

        public PageShapes(int pageNumber, IEnumerable<Shape> shapes)
        {
            PageNumber = pageNumber;
            Shapes = shapes;
        }

        protected bool Equals(PageShapes other)
        {
            return PageNumber == other.PageNumber && Shapes.SequenceEqual(other.Shapes);
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
            return HashCode.Combine(PageNumber, Shapes);
        }

        public override string ToString()
        {
            var stringBuilder = new StringBuilder($"--Page number: {PageNumber}");

            foreach (var shape in Shapes)
            {
                stringBuilder.Append($"{shape}");
            }

            return stringBuilder.ToString();
        }
    }
}
