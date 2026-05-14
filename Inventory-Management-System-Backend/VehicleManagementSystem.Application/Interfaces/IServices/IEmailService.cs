namespace VehicleManagementSystem.Application.Interfaces.IServices
{
    public interface IEmailService
    {
        Task SendInvoiceEmailAsync(int saleId, string toEmail);
    }
}
