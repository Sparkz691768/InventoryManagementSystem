using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Application.Interfaces.IRepositories
{
    public interface IVendorRepository
    {
        Task<List<Vendor>> GetAllAsync();

        Task<Vendor?> GetByIdAsync(int id);

        Task<Vendor> AddAsync(Vendor vendor);

        Task<Vendor?> UpdateAsync(int id, Vendor vendor);

        Task<bool> DeleteAsync(int id);
    }
}