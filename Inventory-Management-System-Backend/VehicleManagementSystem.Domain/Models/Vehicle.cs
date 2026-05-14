using System.ComponentModel.DataAnnotations;

namespace VehicleManagementSystem.Domain.Models
{
    public class Vehicle
    {
        public int Id { get; set; }

        [Required]
        [StringLength(30)]
        public string VehicleNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Make { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Model { get; set; } = string.Empty;

        [Required]
        public int Year { get; set; }
        //uPDATED ONE 
        [Required]
        [StringLength(30)]
        public string Color { get; set; } = string.Empty;

        public int CustomerId { get; set; }

        public Customer Customer { get; set; } = null!;
    }
}