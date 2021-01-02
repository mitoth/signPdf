using System;
using System.Collections.Generic;

namespace RedactMyPdf.Viewer.Dtos
{
    /// <summary>
    /// Represents a processed document
    /// </summary>
    public class ProcessedDocumentDto
    {
        public Guid Id { get; set; }
        public IEnumerable<ProcessedPageImageDto> Pages { get; set; }
    }
}
