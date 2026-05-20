using Microsoft.AspNetCore.Mvc;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.DTOs.Sale;

namespace VehicleManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SaleController : ControllerBase
    {
        private readonly ISaleService _service;

        public SaleController(ISaleService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSale(CreateSaleDto dto)
        {
            var result = await _service.CreateSaleAsync(dto);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSales()
        {
            var result = await _service.GetAllSalesAsync();
            return Ok(result);
        }

        [HttpGet("overdue")]
        public async Task<IActionResult> GetOverdueSales()
        {
            var result = await _service.GetOverdueSalesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSaleById(int id)
        {
            var result = await _service.GetSaleByIdAsync(id);

            if (result == null)
                return NotFound("Sale not found");

            return Ok(result);
        }
        [HttpPost("{id}/send-invoice")]
        public async Task<IActionResult> SendInvoice(int id)
        {
            await _service.SendInvoiceAsync(id);
            return Ok(new { message = "Invoice sent successfully" });
        }

        [HttpPost("verify-esewa")]
        public async Task<IActionResult> VerifyEsewa(VerifyEsewaDto dto)
        {
            var success = await _service.VerifyEsewaPaymentAsync(dto);
            if (success)
            {
                return Ok(new { success = true, message = "Payment verified successfully!" });
            }
            return BadRequest(new { success = false, message = "Payment verification failed." });
        }
    }
}