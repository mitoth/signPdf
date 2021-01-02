namespace RedactMyPdf.Core.Utils
{
    /// <summary>
    /// Convert Aspose Points to Pixels and vice versa
    /// </summary>
    public static class UnitsOfMeasure
    {
        /// <summary>
        /// Convert Points to Pixels
        /// </summary>
        /// <param name="points">Points</param>
        /// <returns></returns>
        public static int ToPixels(int points)
        {
            return points * 96 / 72;
        }

        /// <summary>
        /// Convert Pixels to Point
        /// </summary>
        /// <param name="pixels">Pixels</param>
        /// <returns></returns>
        public static float ToPoints(float pixels)
        {
            return pixels * 72 / 96;
        }
    }
}