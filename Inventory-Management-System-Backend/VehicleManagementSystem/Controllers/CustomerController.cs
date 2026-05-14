using Microsoft.AspNetCore.Mvc;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.DTOs.Customer;

namespace VehicleManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomerController(ICustomerService service)
        {
            _service = service;
        }

        // POST: register customer + vehicle
        [HttpPost("register-with-vehicle")]
        public async Task<IActionResult> RegisterCustomerWithVehicle([FromBody] CreateCustomerWithVehicleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.RegisterCustomerWithVehicleAsync(dto);
            return Ok(result);
        }

        // GET: customer with vehicles
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomerWithVehicles(int id)
        {
            var customer = await _service.GetCustomerWithVehiclesAsync(id);

            if (customer == null)
                return NotFound("Customer not found");

            return Ok(customer);
        }

        // GET: api/customers/search?name=...&phone=...&id=...&vehicleNumber=...
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? name, [FromQuery] string? phone, [FromQuery] int? id, [FromQuery] string? vehicleNumber)
        {
            var results = await _service.SearchCustomersAsync(name, phone, id, vehicleNumber);
            return Ok(results);
        }
    }
}