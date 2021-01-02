using System;

namespace RedactMyPdf.Core.Models.Draw
{
    public class Axis
    {
        public readonly float X;
        public readonly float Y;

        public Axis(float x, float y)
        {
            X = x;
            Y = y;
        }

        private bool Equals(Axis other)
        {
            return X.Equals(other.X) && Y.Equals(other.Y);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj.GetType() == GetType() && Equals((Axis) obj);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(X, Y);
        }

        public override string ToString()
        {
            return $"{nameof(X)}: {X}, {nameof(Y)}: {Y}";
        }
    }
}
