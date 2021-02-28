// ReSharper disable MemberCanBePrivate.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
namespace RedactMyPdf.Viewer.Dtos
{
    public class ProcessedPageImageDto
    {
        public int Width { get; }
        public int Height { get; }

        public ProcessedPageImageDto(int width, int height)
        {
            Width = width;
            Height = height;
        }
    }
}
