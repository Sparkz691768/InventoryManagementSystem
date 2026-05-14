using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.DTOs.Staff;
using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Infrastructure.Services
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _repository;

        public StaffService(IStaffRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<StaffResponseDto>> GetAllStaffAsync()
        {
            var staffList = await _repository.GetAllAsync();

            return staffList.Select(s => new StaffResponseDto
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email,
                Role = s.Role,
                PhoneNumber = s.PhoneNumber,
                CreatedAt = s.CreatedAt
            }).ToList();
        }

        public async Task<StaffResponseDto?> GetStaffByIdAsync(int id)
        {
            var staff = await _repository.GetByIdAsync(id);

            if (staff == null) return null;

            return new StaffResponseDto
            {
                Id = staff.Id,
                FullName = staff.FullName,
                Email = staff.Email,
                Role = staff.Role,
                PhoneNumber = staff.PhoneNumber,
                CreatedAt = staff.CreatedAt
            };
        }

        public async Task<StaffResponseDto> CreateStaffAsync(CreateStaffDto dto)
        {
            var staff = new Staff
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                Role = dto.Role,
                PhoneNumber = dto.PhoneNumber
            };

            var created = await _repository.AddAsync(staff);

            return new StaffResponseDto
            {
                Id = created.Id,
                FullName = created.FullName,
                Email = created.Email,
                Role = created.Role,
                PhoneNumber = created.PhoneNumber,
                CreatedAt = created.CreatedAt
            };
        }

        public async Task<StaffResponseDto?> UpdateStaffAsync(int id, UpdateStaffDto dto)
        {
            var staff = new Staff
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                Role = dto.Role,
                PhoneNumber = dto.PhoneNumber
            };

            var updated = await _repository.UpdateAsync(id, staff);

            if (updated == null) return null;

            return new StaffResponseDto
            {
                Id = updated.Id,
                FullName = updated.FullName,
                Email = updated.Email,
                Role = updated.Role,
                PhoneNumber = updated.PhoneNumber,
                CreatedAt = updated.CreatedAt
            };
        }

        public async Task<bool> DeleteStaffAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}