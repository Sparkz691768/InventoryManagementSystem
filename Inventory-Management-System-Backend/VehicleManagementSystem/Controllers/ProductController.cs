using Microsoft.AspNetCore.Mvc;
using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.DTOs.Product;
using VehicleManagementSystem.Domain.Models;
using VehicleManagementSystem.Infrastructure.Persistence;

namespace VehicleManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _repository;
        private readonly ApplicationDbContext _context;

        public ProductController(IProductRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _repository.GetAllAsync();
            
            var response = products.Select(p => new ProductResponseDto
            {
                Id = p.Id,
                ProductName = p.Name,
                SKU = p.SKU,
                Price = p.UnitPrice,
                StockQuantity = p.StockQuantity
            });

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }
    }
}
