using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.Domain.Models;
using VehicleManagementSystem.DTOs.Sale;

namespace VehicleManagementSystem.Infrastructure.Services
{
    public class SaleService : ISaleService
    {
        private readonly ISaleRepository _repository;
        private readonly IProductRepository _productRepository;
        private readonly IEmailService _emailService;

        public SaleService(ISaleRepository repository, IProductRepository productRepository, IEmailService emailService)
        {
            _repository = repository;
            _productRepository = productRepository;
            _emailService = emailService;
        }

        public async Task<SaleResponseDto> CreateSaleAsync(CreateSaleDto dto)
        {
            // If items are provided compute total from items and validate stock
            decimal itemsTotal = 0;
            var saleItems = new List<SaleItem>();

            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var it in dto.Items)
                {
                    var prod = await _productRepository.GetByIdAsync(it.ProductId);
                    if (prod == null)
                        throw new InvalidOperationException($"Product {it.ProductId} not found");

                    if (prod.StockQuantity < it.Quantity)
                        throw new InvalidOperationException($"Insufficient stock for product {prod.Name}");

                    var unit = prod.UnitPrice;
                    var total = unit * it.Quantity;
                    itemsTotal += total;

                    saleItems.Add(new SaleItem
                    {
                        ProductId = prod.Id,
                        Quantity = it.Quantity,
                        UnitPrice = unit,
                        TotalPrice = total
                    });
                }
            }

            var totalAmount = dto.Items != null && dto.Items.Any() ? itemsTotal : dto.TotalAmount;

            decimal discount = 0;
            string message = "No discount applied";

            if (totalAmount > 5000)
            {
                discount = totalAmount * 0.10m;
                message = "10% loyalty discount applied";
            }

            decimal finalAmount = totalAmount - discount;

            var sale = new Sale
            {
                CustomerId = dto.CustomerId,
                TotalAmount = totalAmount,
                DiscountAmount = discount,
                FinalAmount = finalAmount,
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}"
            };

            var created = await _repository.AddSaleWithItemsAsync(sale, saleItems);

            return new SaleResponseDto
            {
                Id = created.Id,
                CustomerId = created.CustomerId,
                TotalAmount = created.TotalAmount,
                DiscountAmount = created.DiscountAmount,
                FinalAmount = created.FinalAmount,
                SaleDate = created.SaleDate,
                Message = message,
                InvoiceNumber = created.InvoiceNumber
            };
        }

        public async Task<List<SaleResponseDto>> GetAllSalesAsync()
        {
            var sales = await _repository.GetAllSalesAsync();

            return sales.Select(s => new SaleResponseDto
            {
                Id = s.Id,
                CustomerId = s.CustomerId,
                TotalAmount = s.TotalAmount,
                DiscountAmount = s.DiscountAmount,
                FinalAmount = s.FinalAmount,
                SaleDate = s.SaleDate,
                Message = s.DiscountAmount > 0 ? "Discount Applied" : "No Discount",
                InvoiceNumber = s.InvoiceNumber
            }).ToList();
        }

        public async Task<SaleResponseDto?> GetSaleByIdAsync(int id)
        {
            var s = await _repository.GetSaleWithCustomerAsync(id);

            if (s == null) return null;

            var items = new List<SaleItemResponseDto>();
            if (s.Items != null && s.Items.Any())
            {
                foreach (var it in s.Items)
                {
                    var prod = await _productRepository.GetByIdAsync(it.ProductId);
                    items.Add(new SaleItemResponseDto
                    {
                        ProductId = it.ProductId,
                        ProductName = prod?.Name ?? string.Empty,
                        Quantity = it.Quantity,
                        UnitPrice = it.UnitPrice,
                        TotalPrice = it.TotalPrice
                    });
                }
            }

            return new SaleResponseDto
            {
                Id = s.Id,
                CustomerId = s.CustomerId,
                TotalAmount = s.TotalAmount,
                DiscountAmount = s.DiscountAmount,
                FinalAmount = s.FinalAmount,
                SaleDate = s.SaleDate,
                Message = s.DiscountAmount > 0 ? "Discount Applied" : "No Discount",
                InvoiceNumber = s.InvoiceNumber,
                Items = items
            };
        }
        public async Task SendInvoiceAsync(int saleId)
        {
            await _emailService.SendInvoiceEmailAsync(saleId, string.Empty);
        }
    }
}