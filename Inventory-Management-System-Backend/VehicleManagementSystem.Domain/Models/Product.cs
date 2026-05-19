using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagementSystem.Domain.Models
{
    [Table("Parts")]
    public class Product
    {
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        [Column("PartName")]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        [Column("PartNumber")]
        public string SKU { get; set; } = string.Empty;

        [Required]
        [Column("SellingPrice")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column("Quantity")]
        public int StockQuantity { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
