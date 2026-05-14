using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Application.Interfaces.IRepositories
{
    public interface ICustomerRepository
    {
        Task<Customer> AddCustomerAsync(Customer customer);

        Task<Vehicle> AddVehicleAsync(Vehicle vehicle);

        Task<Customer?> GetCustomerWithVehiclesAsync(int customerId);

        // Search customers by name, phone, id or vehicle number
        Task<List<Customer>> SearchAsync(string? name, string? phone, int? id, string? vehicleNumber);
    }
}