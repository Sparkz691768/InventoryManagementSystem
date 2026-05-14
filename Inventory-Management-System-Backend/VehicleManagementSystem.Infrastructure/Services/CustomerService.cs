using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.Domain.Models;
using VehicleManagementSystem.DTOs.Customer;

namespace VehicleManagementSystem.Infrastructure.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repository;

        public CustomerService(ICustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task<CustomerResponseDto> RegisterCustomerWithVehicleAsync(CreateCustomerWithVehicleDto dto)
        {
            var customer = new Customer
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };

            var createdCustomer = await _repository.AddCustomerAsync(customer);

            var vehicle = new Vehicle
            {
                VehicleNumber = dto.VehicleNumber,
                Make = dto.Make,
                Model = dto.Model,
                Year = dto.Year,
                Color = dto.Color,
                CustomerId = createdCustomer.Id
            };

            var createdVehicle = await _repository.AddVehicleAsync(vehicle);

            return new CustomerResponseDto
            {
                Id = createdCustomer.Id,
                FullName = createdCustomer.FullName,
                Email = createdCustomer.Email,
                Phone = createdCustomer.Phone,
                Address = createdCustomer.Address,
                RegisteredAt = createdCustomer.RegisteredAt,
                Vehicles = new List<VehicleResponseDto>
                {
                    new VehicleResponseDto
                    {
                        Id = createdVehicle.Id,
                        VehicleNumber = createdVehicle.VehicleNumber,
                        Make = createdVehicle.Make,
                        Model = createdVehicle.Model,
                        Year = createdVehicle.Year,
                        Color = createdVehicle.Color
                    }
                }
            };
        }

        public async Task<CustomerResponseDto?> GetCustomerWithVehiclesAsync(int customerId)
        {
            var customer = await _repository.GetCustomerWithVehiclesAsync(customerId);

            if (customer == null)
                return null;

            return new CustomerResponseDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone,
                Address = customer.Address,
                RegisteredAt = customer.RegisteredAt,
                Vehicles = customer.Vehicles.Select(v => new VehicleResponseDto
                {
                    Id = v.Id,
                    VehicleNumber = v.VehicleNumber,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    Color = v.Color
                }).ToList()
            };
        }

        public async Task<List<CustomerResponseDto>> SearchCustomersAsync(string? name, string? phone, int? id, string? vehicleNumber)
        {
            var customers = await _repository.SearchAsync(name, phone, id, vehicleNumber);

            return customers.Select(c => new CustomerResponseDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Email = c.Email,
                Phone = c.Phone,
                Address = c.Address,
                RegisteredAt = c.RegisteredAt,
                Vehicles = c.Vehicles.Select(v => new VehicleResponseDto
                {
                    Id = v.Id,
                    VehicleNumber = v.VehicleNumber,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    Color = v.Color
                }).ToList()
            }).ToList();
        }
    }
}