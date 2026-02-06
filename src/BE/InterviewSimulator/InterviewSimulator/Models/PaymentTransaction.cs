using System;
using System.Collections.Generic;

namespace InterviewSimulator.Models;

public partial class PaymentTransaction
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public decimal Amount { get; set; }

    public DateTime TransactionDate { get; set; }

    public byte Status { get; set; } // 0: Pending, 1: Success, 2: Failed

    public string? TransactionCode { get; set; } // From Payment Gateway (e.g. PayPal ID)

    public virtual User User { get; set; } = null!;
}
