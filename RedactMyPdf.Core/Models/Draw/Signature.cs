using System;

namespace RedactMyPdf.Core.Models.Draw
{
    public class Signature : Shape
    {
        public readonly float Width;
        public readonly float Height;
        public readonly string Text;
        public readonly string Font;

        public Signature(Axis axis, float width, float height, string text, string font) : base(axis)
        {
            Width = width;
            Height = height;
            Text = text;
            Font = font;
        }

        protected bool Equals(Signature other)
        {
            return Width.Equals(other.Width) && Height.Equals(other.Height) && Text == other.Text && Font == other.Font;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((Signature) obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Width, Height, Text, Font);
        }

        public override string ToString()
        {
            return $"{nameof(Width)}: {Width}, {nameof(Height)}: {Height}, {nameof(Text)}: {Text}, {nameof(Font)}: {Font}";
        }
    }
}