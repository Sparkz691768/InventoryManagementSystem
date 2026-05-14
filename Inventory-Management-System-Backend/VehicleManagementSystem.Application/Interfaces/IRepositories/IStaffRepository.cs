using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Application.Interfaces.IRepositories
{
    public interface IStaffRepository
    {
        Task<List<Staff>> GetAllAsync();

        Task<Staff?> GetByIdAsync(int id);

        Task<Staff> AddAsync(Staff staff);

        Task<Staff?> UpdateAsync(int id, Staff staff);

        Task<bool> DeleteAsync(int id);
    }
}