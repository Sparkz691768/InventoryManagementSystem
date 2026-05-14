using System.ComponentModel.DataAnnotations;

namespace VehicleManagementSystem.DTOs.Staff
{
    public class CreateStaffDto
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression("Admin|Staff", ErrorMessage = "Role must be either Admin or Staff")]
        public string Role { get; set; } = "Staff";

        [Required]
        [StringLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}