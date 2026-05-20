namespace VehicleManagementSystem.DTOs.Sale
{
    public class SaleResponseDto
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal FinalAmount { get; set; }

        public DateTime SaleDate { get; set; }

        public string Message { get; set; } = string.Empty;

        public string InvoiceNumber { get; set; } = string.Empty;

        // NEW PAYMENT FIELDS
        public string PaymentStatus { get; set; } = "Paid";
        public string PaymentMethod { get; set; } = "Cash";
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public DateTime? DueDate { get; set; }

        // eSewa payment gateway parameters (if method is Online)
        public EsewaParametersDto? EsewaParameters { get; set; }

        public List<SaleItemResponseDto> Items { get; set; } = new();
    }

    public class EsewaParametersDto
    {
        public string Amount { get; set; } = string.Empty;
        public string TaxAmount { get; set; } = "0";
        public string ServiceCharge { get; set; } = "0";
        public string DeliveryCharge { get; set; } = "0";
        public string TotalAmount { get; set; } = string.Empty;
        public string TransactionUuid { get; set; } = string.Empty;
        public string ProductCode { get; set; } = "EPAYTEST";
        public string Signature { get; set; } = string.Empty;
        public string SignedFieldNames { get; set; } = "total_amount,transaction_uuid,product_code";
        public string SuccessUrl { get; set; } = "http://localhost:5173/";
        public string FailureUrl { get; set; } = "http://localhost:5173/?esewa=failure";
    }

    public class SaleItemResponseDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class VerifyEsewaDto
    {
        public string Data { get; set; } = string.Empty;
    }
}