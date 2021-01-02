namespace RedactMyPdf.Core.Models.Draw
{
    public abstract class Shape
    {
        public readonly Axis Axis;

        protected Shape(Axis axis)
        {
            Axis = axis;
        }

        protected bool Equals(Shape other)
        {
            return Axis.Equals(other.Axis);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((Shape) obj);
        }

        public override int GetHashCode()
        {
            return (Axis != null ? Axis.GetHashCode() : 0);
        }

        public override string ToString()
        {
            return $"{nameof(Axis)}: {Axis}";
        }
    }
}
