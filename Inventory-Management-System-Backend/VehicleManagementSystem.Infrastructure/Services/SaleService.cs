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

            // NEW PAYMENT CALCULATIONS
            string paymentStatus = dto.PaymentStatus ?? "Paid";
            string paymentMethod = dto.PaymentMethod ?? "Cash";
            decimal paidAmount = 0;
            decimal remainingAmount = 0;
            DateTime? dueDate = null;

            if (paymentStatus == "Paid")
            {
                paidAmount = finalAmount;
                remainingAmount = 0;
            }
            else if (paymentStatus == "Unpaid")
            {
                paidAmount = 0;
                remainingAmount = finalAmount;
                dueDate = DateTime.UtcNow.AddMinutes(1);
            }
            else if (paymentStatus == "Partial")
            {
                paidAmount = Math.Min(dto.PaidAmount, finalAmount);
                remainingAmount = finalAmount - paidAmount;
                dueDate = DateTime.UtcNow.AddMinutes(1);
            }

            var invoiceNum = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}";

            var sale = new Sale
            {
                CustomerId = dto.CustomerId,
                TotalAmount = totalAmount,
                DiscountAmount = discount,
                FinalAmount = finalAmount,
                InvoiceNumber = invoiceNum,
                PaymentStatus = paymentStatus,
                PaymentMethod = paymentMethod,
                PaidAmount = paidAmount,
                RemainingAmount = remainingAmount,
                DueDate = dueDate
            };

            var created = await _repository.AddSaleWithItemsAsync(sale, saleItems);

            // eSewa Parameters Generator (if online payment)
            EsewaParametersDto? esewaParams = null;
            if (paymentMethod == "Online")
            {
                esewaParams = PrepareEsewaParameters(invoiceNum, finalAmount);
            }

            return new SaleResponseDto
            {
                Id = created.Id,
                CustomerId = created.CustomerId,
                TotalAmount = created.TotalAmount,
                DiscountAmount = created.DiscountAmount,
                FinalAmount = created.FinalAmount,
                SaleDate = created.SaleDate,
                Message = message,
                InvoiceNumber = created.InvoiceNumber,
                PaymentStatus = created.PaymentStatus,
                PaymentMethod = created.PaymentMethod,
                PaidAmount = created.PaidAmount,
                RemainingAmount = created.RemainingAmount,
                DueDate = created.DueDate,
                EsewaParameters = esewaParams
            };
        }

        private EsewaParametersDto? PrepareEsewaParameters(string invoiceNumber, decimal amount)
        {
            try
            {
                var secretKey = "8gBm/:&EnhH.1/q"; // eSewa v2 test secret key
                var productCode = "EPAYTEST";
                // E-Sewa requires amounts to match exactly (usually without decimals if whole, but we match the string)
                var amtStr = (amount % 1 == 0) ? amount.ToString("0") : amount.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture);
                
                // eSewa v2 signature format: total_amount=100,transaction_uuid=11-12-13,product_code=EPAYTEST
                var rawData = $"total_amount={amtStr},transaction_uuid={invoiceNumber},product_code={productCode}";
                
                var keyBytes = System.Text.Encoding.UTF8.GetBytes(secretKey);
                using (var hmac = new System.Security.Cryptography.HMACSHA256(keyBytes))
                {
                    var dataBytes = System.Text.Encoding.UTF8.GetBytes(rawData);
                    var hashBytes = hmac.ComputeHash(dataBytes);
                    var signature = Convert.ToBase64String(hashBytes);

                    return new EsewaParametersDto
                    {
                        Amount = amtStr,
                        TotalAmount = amtStr,
                        TransactionUuid = invoiceNumber,
                        ProductCode = productCode,
                        Signature = signature
                    };
                }
            }
            catch
            {
                return null;
            }
        }

        public async Task<List<SaleResponseDto>> GetAllSalesAsync()
        {
            var sales = await _repository.GetAllSalesAsync();

            return sales.Select(s => {
                EsewaParametersDto? esewaParams = null;
                if (s.PaymentMethod == "Online")
                {
                    esewaParams = PrepareEsewaParameters(s.InvoiceNumber, s.FinalAmount);
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
                    PaymentStatus = s.PaymentStatus,
                    PaymentMethod = s.PaymentMethod,
                    PaidAmount = s.PaidAmount,
                    RemainingAmount = s.RemainingAmount,
                    DueDate = s.DueDate,
                    EsewaParameters = esewaParams
                };
            }).ToList();
        }

        public async Task<List<SaleResponseDto>> GetOverdueSalesAsync()
        {
            var sales = await _repository.GetAllSalesAsync();
            var now = DateTime.UtcNow;
            
            var overdueSales = sales.Where(s => 
                (s.PaymentStatus == "Unpaid" || s.PaymentStatus == "Partial") &&
                s.DueDate.HasValue && 
                s.DueDate.Value <= now
            ).ToList();

            return overdueSales.Select(s => new SaleResponseDto
            {
                Id = s.Id,
                CustomerId = s.CustomerId,
                TotalAmount = s.TotalAmount,
                DiscountAmount = s.DiscountAmount,
                FinalAmount = s.FinalAmount,
                SaleDate = s.SaleDate,
                InvoiceNumber = s.InvoiceNumber,
                PaymentStatus = s.PaymentStatus,
                PaymentMethod = s.PaymentMethod,
                PaidAmount = s.PaidAmount,
                RemainingAmount = s.RemainingAmount,
                DueDate = s.DueDate
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

            EsewaParametersDto? esewaParams = null;
            if (s.PaymentMethod == "Online")
            {
                esewaParams = PrepareEsewaParameters(s.InvoiceNumber, s.FinalAmount);
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
                PaymentStatus = s.PaymentStatus,
                PaymentMethod = s.PaymentMethod,
                PaidAmount = s.PaidAmount,
                RemainingAmount = s.RemainingAmount,
                DueDate = s.DueDate,
                EsewaParameters = esewaParams,
                Items = items
            };
        }
        public async Task SendInvoiceAsync(int saleId)
        {
            await _emailService.SendInvoiceEmailAsync(saleId, string.Empty);
        }
    }
}