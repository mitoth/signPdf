namespace RedactMyPdf.Viewer.Dtos
{
    public class ProcessedPageImageDto
    {
        public int Width { get; set; }
        public int Height { get; set; }

        public ProcessedPageImageDto(int width, int height)
        {
            Width = width;
            Height = height;
        }
    }
}
