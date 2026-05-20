using System.ComponentModel.DataAnnotations;

namespace VehicleManagementSystem.Domain.Models
{
    public class Sale
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }

        public Customer? Customer { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal FinalAmount { get; set; }

        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        // Invoice number for generated invoices
        public string InvoiceNumber { get; set; } = string.Empty;

        // NEW PAYMENT TRACKING PROPERTIES
        public string? PaymentStatus { get; set; } = "Paid"; // Paid, Unpaid, Partial
        public string? PaymentMethod { get; set; } = "Cash"; // Cash, Credit, Online
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public DateTime? DueDate { get; set; }

        // Tracks if overdue reminder email has already been sent (prevents duplicates)
        public bool ReminderSent { get; set; } = false;

        // Navigation to sale items
        public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
    }
}