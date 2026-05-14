using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Application.Interfaces.IRepositories
{
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(int id);
        Task<List<Product>> GetAllAsync();
        Task UpdateAsync(Product product);
    }
}
