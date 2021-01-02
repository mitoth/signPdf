using System.Drawing;
using Aspose.Pdf;
using Aspose.Pdf.Text;
using RedactMyPdf.Core.Models.Draw;
using AsposePdf = Aspose.Pdf;

namespace RedactMyPdf.FileHandler.Aspose.Drawing
{
    public class TextBoxPencil : IPencil
    {

        private readonly TextBox textBox;

        public TextBoxPencil(TextBox textBox)
        {
            this.textBox = textBox;
        }

        public void Draw(Page page)
        {
            SetPageMargins(page);

            var textFragment = new TextFragment(textBox.Text)
            {
                Position = new Position(textBox.Axis.X, textBox.Axis.Y),
                TextState =
                {
                    FontSize = textBox.TextSize,
                    Font = FontRepository.FindFont(textBox.Font)
                }
            };

            if (!string.IsNullOrWhiteSpace(textBox.BackgroundColorHtmlCode))
            {
                textFragment.TextState.BackgroundColor =
                    AsposePdf.Color.FromRgb(ColorTranslator.FromHtml(textBox.BackgroundColorHtmlCode));
            }

            if (string.IsNullOrWhiteSpace(textBox.TextColorHtmlCode))
            {
                textFragment.TextState.ForegroundColor =
                    AsposePdf.Color.FromRgb(ColorTranslator.FromHtml(textBox.TextColorHtmlCode));
            }

            // Create TextBuilder object
            var textBuilder = new TextBuilder(page);
            textBuilder.AppendText(textFragment);
        }

        private void SetPageMargins(Page page)
        {
            page.PageInfo.Margin.Left = page.PageInfo.Margin.Right
                = page.PageInfo.Margin.Bottom = page.PageInfo.Margin.Top = 0;
        }
    }
}
