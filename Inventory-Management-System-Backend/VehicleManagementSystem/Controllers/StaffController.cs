using Microsoft.AspNetCore.Mvc;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.DTOs.Staff;

namespace VehicleManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdStaff = await _staffService.CreateStaffAsync(dto);

            return CreatedAtAction(nameof(GetStaffById), new { id = createdStaff.Id }, createdStaff);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStaff()
        {
            var staffs = await _staffService.GetAllStaffAsync();
            return Ok(staffs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);

            if (staff == null)
                return NotFound("Staff not found");

            return Ok(staff);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedStaff = await _staffService.UpdateStaffAsync(id, dto);

            if (updatedStaff == null)
                return NotFound("Staff not found");

            return Ok(updatedStaff);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var deleted = await _staffService.DeleteStaffAsync(id);

            if (!deleted)
                return NotFound("Staff not found");

            return Ok("Staff deleted successfully");
        }
    }
}