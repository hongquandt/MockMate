using InterviewSimulator.DTOs;
using InterviewSimulator.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace InterviewSimulator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly MockMateDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public PaymentController(MockMateDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("create-payment-link")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentLink([FromBody] VipPaymentRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = int.Parse(userIdStr);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            // Hardcode Plans logic
            int amount = 0;
            string description = "";

            switch (request.PlanId)
            {
                case 1:
                    amount = 50000;
                    description = "Nang cap VIP Tuan";
                    break;
                case 2:
                    amount = 150000;
                    description = "Nang cap VIP Thang";
                    break;
                case 3:
                    amount = 1200000;
                    description = "Nang cap VIP Nam";
                    break;
                default:
                    return BadRequest("Invalid Plan ID");
            }

            // Use a more unique orderCode (timestamp in ms, capped for safe int / long)
            long orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            var transaction = new PaymentTransaction
            {
                UserId = userId,
                Amount = amount,
                Status = 0, // Pending
                TransactionCode = orderCode.ToString(),
                TransactionDate = DateTime.UtcNow
            };
            _context.PaymentTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            try
            {
                // PayOS API Configuration
                var clientId = _configuration["PayOS:ClientId"];
                var apiKey = _configuration["PayOS:ApiKey"];
                var checksumKey = _configuration["PayOS:ChecksumKey"];
                var payosUrl = _configuration["PayOS:PaymentUrl"] ?? "https://api-merchant.payos.vn/v2/payment-requests";

                // Prepare data for items (Mandatory for PayOS)
                var items = new List<object>
                {
                    new { name = description, quantity = 1, price = amount }
                };

                // Prepare data for signature (items is NOT included in payment request signature)
                var returnUrl = request.CallbackUrl + "?status=success&orderCode=" + orderCode;
                var cancelUrl = request.CallbackUrl + "?status=cancelled&orderCode=" + orderCode;

                var dataForSignature = new SortedDictionary<string, object>
                {
                    { "amount", amount },
                    { "cancelUrl", cancelUrl },
                    { "description", description },
                    { "orderCode", orderCode },
                    { "returnUrl", returnUrl }
                };

                // Generate signature
                var signature = GenerateSignature(dataForSignature, checksumKey);

                // Prepare payload
                var payload = new
                {
                    orderCode = orderCode,
                    amount = amount,
                    description = description,
                    cancelUrl = cancelUrl,
                    returnUrl = returnUrl,
                    items = items,
                    signature = signature
                };

                // Call PayOS API
                var payosRequest = new HttpRequestMessage(HttpMethod.Post, payosUrl);
                payosRequest.Headers.Add("x-client-id", clientId);
                payosRequest.Headers.Add("x-api-key", apiKey);
                payosRequest.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(payosRequest);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    // Rollback transaction
                    _context.PaymentTransactions.Remove(transaction);
                    await _context.SaveChangesAsync();
                    return StatusCode((int)response.StatusCode, new { 
                        message = "PayOS API error", 
                        error = responseContent, 
                        sentPayload = payload 
                    });
                }

                var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var checkoutUrl = payosResponse.GetProperty("data").GetProperty("checkoutUrl").GetString();

                return Ok(new PaymentLinkResponse
                {
                    CheckoutUrl = checkoutUrl ?? "",
                    OrderCode = orderCode.ToString()
                });
            }
            catch (Exception ex)
            {
                // Rollback transaction if payment link creation fails
                try {
                    _context.PaymentTransactions.Remove(transaction);
                    await _context.SaveChangesAsync();
                } catch { /* Ignore rollback failure if main error is already being reported */ }
                
                return StatusCode(500, new { 
                    message = "Failed to create payment link", 
                    error = ex.Message,
                    details = ex.ToString() // Return full details for debugging
                });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook([FromBody] PayOSWebhookBody webhookBody)
        {
            try
            {
                // Verify signature
                var checksumKey = _configuration["PayOS:ChecksumKey"];

                var dataForSignature = new SortedDictionary<string, object>
                {
                    { "amount", webhookBody.data.amount },
                    { "code", webhookBody.code },
                    { "desc", webhookBody.desc },
                    { "orderCode", webhookBody.data.orderCode },
                    { "success", webhookBody.success }
                };

                var expectedSignature = GenerateSignature(dataForSignature, checksumKey);

                if (webhookBody.signature != expectedSignature)
                {
                    return BadRequest(new { message = "Invalid signature" });
                }

                // Update transaction
                var transaction = await _context.PaymentTransactions
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.TransactionCode == webhookBody.data.orderCode.ToString());

                if (transaction != null && transaction.Status == 0 && webhookBody.code == "00")
                {
                    transaction.Status = 1;

                    int durationDays = 0;
                    if (webhookBody.data.amount == 50000) durationDays = 7;
                    else if (webhookBody.data.amount == 150000) durationDays = 30;
                    else if (webhookBody.data.amount >= 1000000) durationDays = 365;

                    transaction.User.IsVip = true;

                    if (transaction.User.VipExpirationDate.HasValue && transaction.User.VipExpirationDate > DateTime.Now)
                    {
                        transaction.User.VipExpirationDate = transaction.User.VipExpirationDate.Value.AddDays(durationDays);
                    }
                    else
                    {
                        transaction.User.VipExpirationDate = DateTime.Now.AddDays(durationDays);
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Webhook received" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Frontend calls this after user returns from PayOS to verify & activate VIP.
        /// This is needed because the webhook may not be reachable (e.g. localhost).
        /// </summary>
        [HttpPost("confirm-payment")]
        [Authorize]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = int.Parse(userIdStr);

            // Find the pending transaction
            var transaction = await _context.PaymentTransactions
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TransactionCode == request.OrderCode && t.UserId == userId);

            if (transaction == null)
                return NotFound(new { message = "Transaction not found" });

            // If already processed, return current status
            if (transaction.Status == 1)
                return Ok(new { message = "Payment already confirmed", isVip = true });

            try
            {
                // Call PayOS API to check order status
                var clientId = _configuration["PayOS:ClientId"];
                var apiKey = _configuration["PayOS:ApiKey"];
                var payosUrl = $"https://api-merchant.payos.vn/v2/payment-requests/{request.OrderCode}";

                var payosRequest = new HttpRequestMessage(HttpMethod.Get, payosUrl);
                payosRequest.Headers.Add("x-client-id", clientId);
                payosRequest.Headers.Add("x-api-key", apiKey);

                var response = await _httpClient.SendAsync(payosRequest);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { message = "Failed to verify payment with PayOS", error = responseContent });
                }

                var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var status = payosResponse.GetProperty("data").GetProperty("status").GetString();

                if (status == "PAID")
                {
                    transaction.Status = 1; // Success

                    int durationDays = 0;
                    if (transaction.Amount == 50000) durationDays = 7;
                    else if (transaction.Amount == 150000) durationDays = 30;
                    else if (transaction.Amount >= 1000000) durationDays = 365;

                    transaction.User.IsVip = true;

                    if (transaction.User.VipExpirationDate.HasValue && transaction.User.VipExpirationDate > DateTime.Now)
                    {
                        transaction.User.VipExpirationDate = transaction.User.VipExpirationDate.Value.AddDays(durationDays);
                    }
                    else
                    {
                        transaction.User.VipExpirationDate = DateTime.Now.AddDays(durationDays);
                    }

                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Payment confirmed, VIP activated!", isVip = true, vipExpirationDate = transaction.User.VipExpirationDate });
                }
                else if (status == "CANCELLED")
                {
                    transaction.Status = 2; // Failed
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Payment was cancelled", isVip = false });
                }
                else
                {
                    return Ok(new { message = $"Payment status: {status}", isVip = false });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error verifying payment", error = ex.Message });
            }
        }

        private string GenerateSignature(SortedDictionary<string, object> data, string checksumKey)
        {
            // Convert to query string
            var queryString = string.Join("&", data.Select(kvp =>
            {
                var value = kvp.Value;
                if (value == null || value.ToString() == "null" || value.ToString() == "undefined")
                {
                    value = "";
                }
                return $"{kvp.Key}={value}";
            }));

            // Generate HMAC-SHA256
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(checksumKey)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(queryString));
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }
    }
}
