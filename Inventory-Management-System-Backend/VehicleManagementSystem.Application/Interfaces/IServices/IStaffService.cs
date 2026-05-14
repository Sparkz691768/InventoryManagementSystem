using VehicleManagementSystem.DTOs.Staff;

namespace VehicleManagementSystem.Application.Interfaces.IServices
{
    public interface IStaffService
    {
        Task<List<StaffResponseDto>> GetAllStaffAsync();

        Task<StaffResponseDto?> GetStaffByIdAsync(int id);

        Task<StaffResponseDto> CreateStaffAsync(CreateStaffDto dto);

        Task<StaffResponseDto?> UpdateStaffAsync(int id, UpdateStaffDto dto);

        Task<bool> DeleteStaffAsync(int id);
    }
}