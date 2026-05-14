using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.DTOs.Vendor;
using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Infrastructure.Services
{
    public class VendorService : IVendorService
    {
        private readonly IVendorRepository _repository;

        public VendorService(IVendorRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<VendorResponseDto>> GetAllVendorsAsync()
        {
            var vendors = await _repository.GetAllAsync();

            return vendors.Select(v => new VendorResponseDto
            {
                Id = v.Id,
                Name = v.Name,
                ContactPerson = v.ContactPerson,
                Email = v.Email,
                Phone = v.Phone,
                Address = v.Address,
                CreatedAt = v.CreatedAt
            }).ToList();
        }

        public async Task<VendorResponseDto?> GetVendorByIdAsync(int id)
        {
            var vendor = await _repository.GetByIdAsync(id);

            if (vendor == null) return null;

            return new VendorResponseDto
            {
                Id = vendor.Id,
                Name = vendor.Name,
                ContactPerson = vendor.ContactPerson,
                Email = vendor.Email,
                Phone = vendor.Phone,
                Address = vendor.Address,
                CreatedAt = vendor.CreatedAt
            };
        }

        public async Task<VendorResponseDto> CreateVendorAsync(CreateVendorDto dto)
        {
            var vendor = new Vendor
            {
                Name = dto.Name,
                ContactPerson = dto.ContactPerson,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };

            var created = await _repository.AddAsync(vendor);

            return new VendorResponseDto
            {
                Id = created.Id,
                Name = created.Name,
                ContactPerson = created.ContactPerson,
                Email = created.Email,
                Phone = created.Phone,
                Address = created.Address,
                CreatedAt = created.CreatedAt
            };
        }

        public async Task<VendorResponseDto?> UpdateVendorAsync(int id, UpdateVendorDto dto)
        {
            var vendor = new Vendor
            {
                Name = dto.Name,
                ContactPerson = dto.ContactPerson,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };

            var updated = await _repository.UpdateAsync(id, vendor);

            if (updated == null) return null;

            return new VendorResponseDto
            {
                Id = updated.Id,
                Name = updated.Name,
                ContactPerson = updated.ContactPerson,
                Email = updated.Email,
                Phone = updated.Phone,
                Address = updated.Address,
                CreatedAt = updated.CreatedAt
            };
        }

        public async Task<bool> DeleteVendorAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}