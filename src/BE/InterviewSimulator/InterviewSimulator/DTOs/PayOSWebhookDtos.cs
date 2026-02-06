namespace InterviewSimulator.DTOs
{
    public class PayOSWebhookData
    {
        public long orderCode { get; set; }
        public int amount { get; set; }
        public string? description { get; set; }
        public string? accountNumber { get; set; }
        public string? reference { get; set; }
        public string? transactionDateTime { get; set; }
    }

    public class PayOSWebhookBody
    {
        public string code { get; set; } = "";
        public string desc { get; set; } = "";
        public bool success { get; set; }
        public PayOSWebhookData data { get; set; } = new();
        public string signature { get; set; } = "";
    }
}
