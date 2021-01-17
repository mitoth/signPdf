using System;
using System.Collections.Generic;
using System.Linq;

namespace RedactMyPdf.Core.Models
{
    /// <summary>
    /// Represents a 'clean' document with its pages.
    /// </summary>
    public class Document
    {
        public readonly Guid Id;
        public readonly string Name;
        public readonly string FileBinaryId;
        public readonly IEnumerable<Page> Pages;

        public Document(Guid id, string name, string fileBinaryId, IEnumerable<Page> pages)
        {
            Id = id;
            Name = name;
            FileBinaryId = fileBinaryId;
            Pages = pages;
        }

        protected bool Equals(Document other)
        {
            return Id.Equals(other.Id) && Name == other.Name && FileBinaryId == other.FileBinaryId && Pages.SequenceEqual(other.Pages);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((Document) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = Id.GetHashCode();
                hashCode = (hashCode * 397) ^ (Name != null ? Name.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (FileBinaryId != null ? FileBinaryId.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (Pages != null ? Pages.GetHashCode() : 0);
                return hashCode;
            }
        }

        public override string ToString()
        {
            return $"{nameof(Id)}: {Id}, {nameof(Name)}: {Name}, {nameof(FileBinaryId)}: {FileBinaryId}, {nameof(Pages)}: {Pages.Count()}";
        }
    }
}