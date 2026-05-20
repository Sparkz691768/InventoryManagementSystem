using VehicleManagementSystem.DTOs.Sale;

namespace VehicleManagementSystem.Application.Interfaces.IServices
{
    public interface ISaleService
    {
        Task<SaleResponseDto> CreateSaleAsync(CreateSaleDto dto);

        Task<List<SaleResponseDto>> GetAllSalesAsync();

        Task<SaleResponseDto?> GetSaleByIdAsync(int id);

        Task<List<SaleResponseDto>> GetOverdueSalesAsync();

        Task SendInvoiceAsync(int saleId);

        Task<bool> VerifyEsewaPaymentAsync(VerifyEsewaDto dto);
    }
}