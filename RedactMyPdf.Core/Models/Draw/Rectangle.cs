using System;

namespace RedactMyPdf.Core.Models.Draw
{
    public class Rectangle
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Width;
        public float Height;
        public string BorderHtmlColorCode;
        public float? BorderLineWidth;
        public string FillHtmlColorCode;

        public Rectangle(float x, float y, float width, float height, string borderHtmlColorCode, float? borderLineWidth, string fillHtmlColorCode)
        {
            X = x;
            Y = y;
            Width = width;
            Height = height;
            BorderHtmlColorCode = borderHtmlColorCode;
            BorderLineWidth = borderLineWidth;
            FillHtmlColorCode = fillHtmlColorCode;
        }

        protected bool Equals(Rectangle other)
        {
            return Width.Equals(other.Width) && Height.Equals(other.Height) && BorderHtmlColorCode == other.BorderHtmlColorCode && Nullable.Equals(BorderLineWidth, other.BorderLineWidth) && FillHtmlColorCode == other.FillHtmlColorCode && X.Equals(other.X) && Y.Equals(other.Y);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((Rectangle) obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Width, Height, BorderHtmlColorCode, BorderLineWidth, FillHtmlColorCode, X, Y);
        }
    }
}
