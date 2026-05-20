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
                ? $"<p>Loyalty Points Earned: {loyaltyPoints} Points</p>" 
                : "";

            var dueDateHtml = sale.DueDate.HasValue 
                ? $"<p>Credit Due Date: {sale.DueDate.Value.ToLocalTime():yyyy-MM-dd HH:mm}</p>" 
                : "";

            return $@"
            <div style='font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>
                <div style='background-color: #ffffff; padding: 20px; border: 1px solid #ddd;'>
                    <h2 style='margin-top: 0;'>Invoice - {sale.InvoiceNumber}</h2>
                    <p>Date: {sale.SaleDate.ToLocalTime():yyyy-MM-dd HH:mm}</p>
                    <p>Customer: {sale.Customer?.FullName}</p>
                    <p>Payment Status: {sale.PaymentStatus}</p>
                    <p>Payment Method: {sale.PaymentMethod}</p>

                    <table border='1' cellpadding='6' cellspacing='0' style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                        <thead style='background-color: #eeeeee;'>
                            <tr>
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

                    <br/>
                    <p>Subtotal: NPR {sale.TotalAmount:N2}</p>
                    {(sale.DiscountAmount > 0 ? $"<p>Loyalty Discount (10%): - NPR {sale.DiscountAmount:N2}</p>" : "")}
                    {loyaltyHtml}
                    <p><strong>Final Amount: NPR {sale.FinalAmount:N2}</strong></p>
                    <p>Paid Amount: NPR {sale.PaidAmount:N2}</p>
                    <p>Remaining Amount: NPR {sale.RemainingAmount:N2}</p>
                    {dueDateHtml}

                    <hr style='margin-top: 20px;'/>
                    <p style='font-size: 12px; color: #888;'>This is an automated invoice from AutoLaya Inventory Management System.</p>
                </div>
            </div>
            ";
        }
    }
}