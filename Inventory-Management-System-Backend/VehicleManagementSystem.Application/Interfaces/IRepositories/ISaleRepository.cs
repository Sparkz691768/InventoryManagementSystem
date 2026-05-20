using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Application.Interfaces.IRepositories
{
    public interface ISaleRepository
    {
        Task<Sale> AddSaleAsync(Sale sale);
        Task<Sale> AddSaleWithItemsAsync(Sale sale, IEnumerable<SaleItem> items);

        Task<List<Sale>> GetAllSalesAsync();

        Task<Sale?> GetSaleByIdAsync(int id);

        Task<Sale?> GetSaleWithCustomerAsync(int id);
        Task UpdateSaleAsync(Sale sale);
    }
}