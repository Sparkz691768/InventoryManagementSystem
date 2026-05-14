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

        // Navigation to sale items
        public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
    }
}