using Aspose.Pdf;

namespace RedactMyPdf.FileHandler.Aspose.Drawing
{
    public interface IPencil
    {
        /// <summary>
        /// Draw shapes on a page
        /// </summary>
        /// <param name="page">The Aspose page where to draw the shapes</param>
        void Draw(Page page);
    }
}
