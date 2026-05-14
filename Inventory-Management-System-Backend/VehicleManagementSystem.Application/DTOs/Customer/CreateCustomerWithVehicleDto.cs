using System.ComponentModel.DataAnnotations;

namespace VehicleManagementSystem.DTOs.Customer
{
    public class CreateCustomerWithVehicleDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        // Vehicle
        [Required]
        public string VehicleNumber { get; set; } = string.Empty;

        [Required]
        public string Make { get; set; } = string.Empty;

        [Required]
        public string Model { get; set; } = string.Empty;

        [Required]
        public int Year { get; set; }

        [Required]
        public string Color { get; set; } = string.Empty;
    }
}