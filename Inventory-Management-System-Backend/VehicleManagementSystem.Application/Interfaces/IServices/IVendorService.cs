using VehicleManagementSystem.DTOs.Vendor;

namespace VehicleManagementSystem.Application.Interfaces.IServices
{
    public interface IVendorService
    {
        Task<List<VendorResponseDto>> GetAllVendorsAsync();

        Task<VendorResponseDto?> GetVendorByIdAsync(int id);

        Task<VendorResponseDto> CreateVendorAsync(CreateVendorDto dto);

        Task<VendorResponseDto?> UpdateVendorAsync(int id, UpdateVendorDto dto);

        Task<bool> DeleteVendorAsync(int id);
    }
}