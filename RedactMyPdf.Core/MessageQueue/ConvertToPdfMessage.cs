using System;

namespace RedactMyPdf.Core.MessageQueue
{
    public class ConvertToPdfMessage
    {
        public readonly string FileBinaryId;
        /// <summary>
        /// The Id which will be used to store the document that will be created after conversion.
        /// It should be later used to retrieve this document from the database
        /// </summary>
        public readonly Guid NewDocumentGuid;

        public ConvertToPdfMessage(string fileBinaryId, Guid newDocumentGuid)
        {
            FileBinaryId = fileBinaryId;
            NewDocumentGuid = newDocumentGuid;
        }
    }
}
