namespace RedactMyPdf.Core.Models.Draw
{
    public class Rectangle : Shape
    {
        public readonly float Width;
        public readonly float Height;
        public readonly string BorderHtmlColorCode;
        public readonly float? BorderLineWidth;
        public readonly string FillHtmlColorCode;

        public Rectangle(Axis axis, float width, float height, string borderHtmlColorCode, float? borderLineWidth, string fillHtmlColorCode) : base(axis)
        {
            Width = width;
            Height = height;
            BorderHtmlColorCode = borderHtmlColorCode;
            BorderLineWidth = borderLineWidth;
            FillHtmlColorCode = fillHtmlColorCode;
        }

        public override string ToString()
        {
            return $"{base.ToString()}, {nameof(Width)}: {Width}, {nameof(Height)}: {Height}, {nameof(BorderHtmlColorCode)}: {BorderHtmlColorCode}, {nameof(BorderLineWidth)}: {BorderLineWidth}, {nameof(FillHtmlColorCode)}: {FillHtmlColorCode}";
        }
    }
}
