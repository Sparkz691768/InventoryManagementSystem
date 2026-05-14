using Microsoft.EntityFrameworkCore;
using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Domain.Models;
using VehicleManagementSystem.Infrastructure.Persistence;

namespace VehicleManagementSystem.Infrastructure.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly ApplicationDbContext _context;

        public StaffRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Staff>> GetAllAsync()
        {
            return await _context.Staffs.ToListAsync();
        }

        public async Task<Staff?> GetByIdAsync(int id)
        {
            return await _context.Staffs.FindAsync(id);
        }

        public async Task<Staff> AddAsync(Staff staff)
        {
            _context.Staffs.Add(staff);
            await _context.SaveChangesAsync();
            return staff;
        }

        public async Task<Staff?> UpdateAsync(int id, Staff updatedStaff)
        {
            var staff = await _context.Staffs.FindAsync(id);

            if (staff == null)
                return null;

            staff.FullName = updatedStaff.FullName;
            staff.Email = updatedStaff.Email;
            staff.Password = updatedStaff.Password;
            staff.Role = updatedStaff.Role;
            staff.PhoneNumber = updatedStaff.PhoneNumber;

            await _context.SaveChangesAsync();
            return staff;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var staff = await _context.Staffs.FindAsync(id);

            if (staff == null)
                return false;

            _context.Staffs.Remove(staff);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}