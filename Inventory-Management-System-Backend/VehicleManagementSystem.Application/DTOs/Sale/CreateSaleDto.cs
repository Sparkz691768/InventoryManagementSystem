using System.ComponentModel.DataAnnotations;

namespace VehicleManagementSystem.DTOs.Sale
{
    public class CreateSaleDto
    {
        [Required]
        public int CustomerId { get; set; }

        // Optional when items provided. If Items list is provided, TotalAmount will be calculated from items.
        public decimal TotalAmount { get; set; }

        // NEW PAYMENT FIELDS
        public string PaymentStatus { get; set; } = "Paid"; // Paid, Unpaid, Partial
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Credit, Online
        public decimal PaidAmount { get; set; }

        // Sale items for invoice (productId and quantity)
        public List<SaleItemDto> Items { get; set; } = new();
    }
}