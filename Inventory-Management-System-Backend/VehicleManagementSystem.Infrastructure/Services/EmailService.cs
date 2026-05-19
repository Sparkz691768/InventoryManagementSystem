using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Infrastructure.Persistence;
using VehicleManagementSystem.Domain.Models;

namespace VehicleManagementSystem.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ISaleRepository _saleRepository;
        private readonly ApplicationDbContext _context;

        public EmailService(
            IConfiguration config,
            ISaleRepository saleRepository,
            ApplicationDbContext context)
        {
            _config = config;
            _saleRepository = saleRepository;
            _context = context;
        }

        public async Task SendInvoiceEmailAsync(int saleId, string toEmail)
        {
            // Fetch sale with customer
            var sale = await _saleRepository.GetSaleWithCustomerAsync(saleId);

            if (sale == null)
                throw new Exception("Sale not found");

            // Resolve email if not provided
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                if (sale.Customer == null || string.IsNullOrWhiteSpace(sale.Customer.Email))
                    throw new Exception("Customer email not found");

                toEmail = sale.Customer.Email;
            }

            // Generate invoice HTML
            var invoiceHtml = GenerateInvoiceHtml(sale);

            var smtp = _config.GetSection("Smtp");

            var host = smtp["Host"];
            var port = int.Parse(smtp["Port"] ?? "587");
            var username = smtp["Username"];
            var password = smtp["Password"];
            var from = smtp["From"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password) || string.IsNullOrEmpty(from))
                throw new Exception("SMTP configuration is missing or invalid");

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            using var mail = new MailMessage(
                new MailAddress(from),
                new MailAddress(toEmail))
            {
                Subject = $"Invoice {sale.InvoiceNumber}",
                Body = invoiceHtml,
                IsBodyHtml = true
            };

            await client.SendMailAsync(mail);
        }

        private string GenerateInvoiceHtml(Sale sale)
        {
            var itemsHtml = string.Empty;

            foreach (var it in sale.Items ?? new List<SaleItem>())
            {
                var product = _context.Products.Find(it.ProductId);
                var name = product?.Name ?? "Unknown";

                itemsHtml += $@"
                <tr>
                    <td>{name}</td>
                    <td>{it.Quantity}</td>
                    <td>NPR {it.UnitPrice:N2}</td>
                    <td>NPR {it.TotalPrice:N2}</td>
                </tr>";
            }

            var loyaltyPoints = sale.TotalAmount > 5000 ? (int)(sale.FinalAmount / 100) : 0;
            var loyaltyHtml = loyaltyPoints > 0 
                ? $"<p style='color: #16a34a; margin: 4px 0;'><strong>Loyalty Points Earned:</strong> {loyaltyPoints} Points</p>" 
                : "";

            var dueDateHtml = sale.DueDate.HasValue 
                ? $"<p style='color: #b45309; margin: 4px 0;'><strong>Credit Due Date:</strong> {sale.DueDate.Value.ToLocalTime():yyyy-MM-dd HH:mm}</p>" 
                : "";

            return $@"
            <h2>Invoice {sale.InvoiceNumber}</h2>
            <p><strong>Date:</strong> {sale.SaleDate.ToLocalTime():yyyy-MM-dd HH:mm}</p>
            <p><strong>Customer:</strong> {sale.Customer?.FullName}</p>
            <p><strong>Payment Status:</strong> {sale.PaymentStatus}</p>
            <p><strong>Payment Method:</strong> {sale.PaymentMethod}</p>

            <table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse; width: 100%; max-width: 600px;'>
                <thead>
                    <tr style='background-color: #f1f5f9;'>
                        <th align='left'>Product</th>
                        <th align='center'>Qty</th>
                        <th align='right'>Unit Price</th>
                        <th align='right'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                </tbody>
            </table>

            <div style='margin-top: 15px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; width: 100%; max-width: 600px; box-sizing: border-box;'>
                <p style='margin: 4px 0;'><strong>Subtotal:</strong> NPR {sale.TotalAmount:N2}</p>
                {(sale.DiscountAmount > 0 ? $"<p style='color: #b91c1c; margin: 4px 0;'><strong>Loyalty Discount (10%):</strong> - NPR {sale.DiscountAmount:N2}</p>" : "")}
                {loyaltyHtml}
                <hr style='margin: 8px 0; border: 0; border-top: 1px solid #e2e8f0;' />
                <p style='font-size: 16px; font-weight: bold; margin: 4px 0; color: #0f172a;'><strong>Final Amount:</strong> NPR {sale.FinalAmount:N2}</p>
                <hr style='margin: 8px 0; border: 0; border-top: 1px solid #e2e8f0;' />
                <p style='margin: 4px 0;'><strong>Paid Amount:</strong> NPR {sale.PaidAmount:N2}</p>
                <p style='margin: 4px 0;'><strong>Remaining Amount:</strong> NPR {sale.RemainingAmount:N2}</p>
                {dueDateHtml}
            </div>
            ";
        }
    }
}