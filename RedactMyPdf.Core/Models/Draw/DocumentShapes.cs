using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RedactMyPdf.Core.Models.Draw
{
    /// <summary>
    /// Represents the shapes that correspond to a document
    /// </summary>
    public class DocumentShapes
    {
        public readonly IEnumerable<PageShapes> Pages;

        public DocumentShapes(IEnumerable<PageShapes> pages)
        {
            Pages = pages;
        }


        protected bool Equals(DocumentShapes other)
        {
            return Pages.SequenceEqual(other.Pages);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((DocumentShapes) obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Pages);
        }

        public override string ToString()
        {
            var stringBuilder = new StringBuilder();

            foreach (var page in Pages)
            {
                stringBuilder.Append($"[{page.Shapes}]");
            }
            // return $"{nameof(Pages)}: {Pages}";

            return stringBuilder.ToString();
        }
    }
}
