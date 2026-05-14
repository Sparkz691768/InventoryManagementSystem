using VehicleManagementSystem.DTOs.Customer;

namespace VehicleManagementSystem.Application.Interfaces.IServices
{
    public interface ICustomerService
    {
        Task<CustomerResponseDto> RegisterCustomerWithVehicleAsync(CreateCustomerWithVehicleDto dto);

        Task<CustomerResponseDto?> GetCustomerWithVehiclesAsync(int customerId);

        // Search customers
        Task<List<CustomerResponseDto>> SearchCustomersAsync(string? name, string? phone, int? id, string? vehicleNumber);
    }
}