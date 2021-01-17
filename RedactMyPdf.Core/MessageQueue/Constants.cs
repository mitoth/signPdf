namespace RedactMyPdf.Core.MessageQueue
{
    public static class Constants
    {
        public static class Exchange
        {
            public const string DirectExchangeName = "Direct";
            public const string TopicExchangeName = "Topic";

        }

        public static class Queue
        {
            public const string ConvertDocumentQueueName = "Convertitorul";
            public const string BurnDocumentQueueName = "Desenatorul";
        }

        public static class RoutingKeys
        {
            public const string ConvertDocumentToJpgRoutingKey = "convert.to.jpg";
            public const string DoneConvertDocumentToJpgRoutingKey = "done.convert.to.jpg";
            public const string BurnDocumentRoutingKey = "burn.to.jpg";
            public const string DoneBurnDocumentRoutingKey = "done.burn.to.jpg";
        }
    }
}
