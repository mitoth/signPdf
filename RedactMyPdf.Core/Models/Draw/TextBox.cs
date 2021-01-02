namespace RedactMyPdf.Core.Models.Draw
{
    public class TextBox : Shape
    {
        public readonly string Text;
        public readonly float TextSize;
        public readonly string Font;
        public readonly string BackgroundColorHtmlCode;
        public readonly string TextColorHtmlCode;

        public TextBox(Axis axis, string text, float textSize, string font, string backgroundColorHtmlCode, string textColorHtmlCode) : base(axis)
        {
            Text = text;
            TextSize = textSize;
            Font = font;
            BackgroundColorHtmlCode = backgroundColorHtmlCode;
            TextColorHtmlCode = textColorHtmlCode;
        }
    }
}
