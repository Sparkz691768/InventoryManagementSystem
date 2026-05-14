using Microsoft.EntityFrameworkCore;
using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Domain.Models;
using VehicleManagementSystem.Infrastructure.Persistence;

namespace VehicleManagementSystem.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _context;

        public CustomerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Customer> AddCustomerAsync(Customer customer)
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return customer;
        }

        public async Task<Vehicle> AddVehicleAsync(Vehicle vehicle)
        {
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            return vehicle;
        }

        public async Task<Customer?> GetCustomerWithVehiclesAsync(int customerId)
        {
            return await _context.Customers
                .Include(c => c.Vehicles)
                .FirstOrDefaultAsync(c => c.Id == customerId);
        }

        public async Task<List<Customer>> SearchAsync(string? name, string? phone, int? id, string? vehicleNumber)
        {
            // Base query includes vehicles
            var query = _context.Customers
                .Include(c => c.Vehicles)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                var n = name.Trim().ToLower();
                query = query.Where(c => EF.Functions.ILike(c.FullName, $"%{n}%"));
            }

            if (!string.IsNullOrWhiteSpace(phone))
            {
                var p = phone.Trim().ToLower();
                query = query.Where(c => EF.Functions.ILike(c.Phone, $"%{p}%"));
            }

            if (id.HasValue)
            {
                query = query.Where(c => c.Id == id.Value);
            }

            if (!string.IsNullOrWhiteSpace(vehicleNumber))
            {
                var v = vehicleNumber.Trim().ToLower();
                // filter customers that have any vehicle matching vehicle number (partial, case-insensitive)
                query = query.Where(c => c.Vehicles.Any(vc => EF.Functions.ILike(vc.VehicleNumber, $"%{v}%")));
            }

            return await query.ToListAsync();
        }
    }
}