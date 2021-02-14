using System;
using System.Collections.Generic;
using System.Linq;
using RedactMyPdf.Core.Models.Draw;

namespace RedactMyPdf.Core.Models
{
    /// <summary>
    /// Represents a document burned with shapes
    /// </summary>
    public class BurnedDocument
    {
        public readonly Guid Id;
        /// <summary>
        /// The Id of the original document. The one on which the shapes were drawn
        /// </summary>
        public readonly Guid OriginalDocumentId;

        /// <summary>
        /// The id used to store the file stream in the file repository
        /// </summary>
        public readonly string FileBinaryId;

        /// <summary>
        /// The shapes that were burned on this document
        /// </summary>
        public readonly IEnumerable<PageShapes> Shapes;

        /// <summary>
        /// The date when this document was created
        /// </summary>
        public readonly DateTime CreationDate;

        public BurnedDocument(Guid id, Guid originalDocumentId, string fileBinaryId, IEnumerable<PageShapes> shapes)
        {
            Id = id;
            OriginalDocumentId = originalDocumentId;
            FileBinaryId = fileBinaryId;
            Shapes = shapes;
            CreationDate = DateTime.UtcNow;
        }

        protected bool Equals(BurnedDocument other)
        {
            return Id.Equals(other.Id) && OriginalDocumentId.Equals(other.OriginalDocumentId) && FileBinaryId == other.FileBinaryId && Shapes.SequenceEqual(other.Shapes);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((BurnedDocument) obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, OriginalDocumentId, FileBinaryId, Shapes);
        }
    }
}
