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
                    <td>{it.UnitPrice:C}</td>
                    <td>{it.TotalPrice:C}</td>
                </tr>";
            }

            return $@"
            <h2>Invoice {sale.InvoiceNumber}</h2>
            <p><strong>Date:</strong> {sale.SaleDate:yyyy-MM-dd}</p>
            <p><strong>Customer:</strong> {sale.Customer?.FullName}</p>

            <table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse'>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                </tbody>
            </table>

            <p><strong>Total:</strong> {sale.TotalAmount:C}</p>
            <p><strong>Discount:</strong> {sale.DiscountAmount:C}</p>
            <p><strong>Final Amount:</strong> {sale.FinalAmount:C}</p>
            ";
        }
    }
}