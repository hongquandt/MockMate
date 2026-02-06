using System.ComponentModel.DataAnnotations;

namespace InterviewSimulator.DTOs
{
    public class VipPaymentRequest
    {
        [Required]
        public int PlanId { get; set; }
        public string CallbackUrl { get; set; } = "http://localhost:5173/vip-success"; // Default frontend return URL
    }

    public class PaymentLinkResponse
    {
        public string CheckoutUrl { get; set; }
        public string OrderCode { get; set; }
    }
}
