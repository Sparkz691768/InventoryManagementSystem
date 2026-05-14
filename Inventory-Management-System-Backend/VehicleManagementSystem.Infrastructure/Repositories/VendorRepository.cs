using Microsoft.EntityFrameworkCore;
using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Domain.Models;
using VehicleManagementSystem.Infrastructure.Persistence;

namespace VehicleManagementSystem.Infrastructure.Repositories
{
    public class VendorRepository : IVendorRepository
    {
        private readonly ApplicationDbContext _context;

        public VendorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Vendor>> GetAllAsync()
        {
            return await _context.Vendors.ToListAsync();
        }

        public async Task<Vendor?> GetByIdAsync(int id)
        {
            return await _context.Vendors.FindAsync(id);
        }

        public async Task<Vendor> AddAsync(Vendor vendor)
        {
            _context.Vendors.Add(vendor);
            await _context.SaveChangesAsync();
            return vendor;
        }

        public async Task<Vendor?> UpdateAsync(int id, Vendor updatedVendor)
        {
            var vendor = await _context.Vendors.FindAsync(id);

            if (vendor == null)
                return null;

            vendor.Name = updatedVendor.Name;
            vendor.ContactPerson = updatedVendor.ContactPerson;
            vendor.Email = updatedVendor.Email;
            vendor.Phone = updatedVendor.Phone;
            vendor.Address = updatedVendor.Address;

            await _context.SaveChangesAsync();
            return vendor;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var vendor = await _context.Vendors.FindAsync(id);

            if (vendor == null)
                return false;

            _context.Vendors.Remove(vendor);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}