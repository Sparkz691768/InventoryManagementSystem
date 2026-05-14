using Microsoft.EntityFrameworkCore;
using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Domain.Models;
using VehicleManagementSystem.Infrastructure.Persistence;

namespace VehicleManagementSystem.Infrastructure.Repositories
{
    public class SaleRepository : ISaleRepository
    {
        private readonly ApplicationDbContext _context;

        public SaleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Sale> AddSaleAsync(Sale sale)
        {
            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            return sale;
        }

        public async Task<List<Sale>> GetAllSalesAsync()
        {
            return await _context.Sales.ToListAsync();
        }

        public async Task<Sale?> GetSaleByIdAsync(int id)
        {
            return await _context.Sales.FindAsync(id);
        }

        public async Task<Sale> AddSaleWithItemsAsync(Sale sale, IEnumerable<SaleItem> items)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                foreach (var it in items)
                {
                    it.SaleId = sale.Id;
                    _context.SaleItems.Add(it);

                    // decrease product stock if product exists
                    var prod = await _context.Products.FindAsync(it.ProductId);
                    if (prod != null)
                    {
                        prod.StockQuantity -= it.Quantity;
                        _context.Products.Update(prod);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return sale;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Sale?> GetSaleWithCustomerAsync(int id)
        {
            return await _context.Sales
                .Include(s => s.Items)
                .Include(s => s.Customer)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
    }
}