using System;

namespace RedactMyPdf.Core.Models.Draw
{
    public class Signature
    {
        public float X { get; set; }
        public float Y { get; set; }        
        public float Width { get; set; }
        public float Height { get; set; }
        public string ImageAsBase64 { get; set; }

        /// <summary>
        /// As seen by the user; important because the signature coordinates are relative to this; maybe a dto would be better
        /// </summary>
        public float PageWidth { get; set; }
        
        /// <summary>
        /// As seen by the user; important because the signature coordinates are relative to this; maybe a dto would be better
        /// </summary>
        public float PageHeight { get; set; }

        public Signature(float x, float y, float width, float height, string imageAsBase64, float pageWidth, float pageHeight)
        {
            X = x;
            Y = y;
            Width = width;
            Height = height;
            ImageAsBase64 = imageAsBase64;
            PageWidth = pageWidth;
            PageHeight = pageHeight;
        }

        protected bool Equals(Signature other)
        {
            return X.Equals(other.X) && Y.Equals(other.Y) && Width.Equals(other.Width) && Height.Equals(other.Height) && ImageAsBase64 == other.ImageAsBase64 && PageWidth.Equals(other.PageWidth) && PageHeight.Equals(other.PageHeight);
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
            return HashCode.Combine(X, Y, Width, Height, ImageAsBase64, PageWidth, PageHeight);
        }
    }
}