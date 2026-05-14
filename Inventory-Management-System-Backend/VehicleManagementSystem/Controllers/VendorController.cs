using Microsoft.AspNetCore.Mvc;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.DTOs.Vendor;

namespace VehicleManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendorController : ControllerBase
    {
        private readonly IVendorService _vendorService;

        public VendorController(IVendorService vendorService)
        {
            _vendorService = vendorService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateVendor([FromBody] CreateVendorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _vendorService.CreateVendorAsync(dto);

            return CreatedAtAction(nameof(GetVendorById), new { id = created.Id }, created);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVendors()
        {
            var vendors = await _vendorService.GetAllVendorsAsync();
            return Ok(vendors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVendorById(int id)
        {
            var vendor = await _vendorService.GetVendorByIdAsync(id);

            if (vendor == null)
                return NotFound("Vendor not found");

            return Ok(vendor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVendor(int id, [FromBody] UpdateVendorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _vendorService.UpdateVendorAsync(id, dto);

            if (updated == null)
                return NotFound("Vendor not found");

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            var deleted = await _vendorService.DeleteVendorAsync(id);

            if (!deleted)
                return NotFound("Vendor not found");

            return Ok("Vendor deleted successfully");
        }
    }
}