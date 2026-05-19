using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using VehicleManagementSystem.Infrastructure.Persistence;

namespace VehicleManagementSystem.Infrastructure.Services
{
    /// <summary>
    /// Background hosted service that checks every 30 seconds for credit sales
    /// whose DueDate has passed and sends an overdue reminder email to the customer.
    /// </summary>
    public class CreditReminderBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CreditReminderBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(30);

        public CreditReminderBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<CreditReminderBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Credit Reminder Background Service started. Checking every 30 seconds.");

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(_checkInterval, stoppingToken);

                try
                {
                    await CheckAndSendCreditRemindersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking/sending credit reminders.");
                }
            }
        }

        private async Task CheckAndSendCreditRemindersAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            var now = DateTime.UtcNow;

            // Find all overdue sales:
            // - PaymentStatus is "Unpaid" or "Partial"
            // - DueDate has passed
            // - ReminderSent is false (to avoid duplicate emails)
            var overdueSales = await context.Sales
                .Include(s => s.Customer)
                .Where(s =>
                    (s.PaymentStatus == "Unpaid" || s.PaymentStatus == "Partial") &&
                    s.DueDate.HasValue &&
                    s.DueDate.Value <= now &&
                    !s.ReminderSent)
                .ToListAsync();

            if (!overdueSales.Any())
            {
                _logger.LogInformation("[CreditReminder] No overdue sales found at {Time}.", now);
                return;
            }

            _logger.LogInformation("[CreditReminder] Found {Count} overdue sale(s). Sending reminders...", overdueSales.Count);

            var smtp = config.GetSection("Smtp");
            var host = smtp["Host"];
            var port = int.Parse(smtp["Port"] ?? "587");
            var username = smtp["Username"];
            var password = smtp["Password"];
            var from = smtp["From"];

            foreach (var sale in overdueSales)
            {
                var customerEmail = sale.Customer?.Email;
                var customerName = sale.Customer?.FullName ?? "Customer";

                if (string.IsNullOrWhiteSpace(customerEmail))
                {
                    _logger.LogWarning("[CreditReminder] Sale #{SaleId} has no customer email. Skipping.", sale.Id);
                    continue;
                }

                try
                {
                    var body = GenerateReminderHtml(sale.InvoiceNumber ?? $"#{sale.Id}", customerName, sale.RemainingAmount, sale.DueDate!.Value);

                    using var client = new SmtpClient(host, port)
                    {
                        Credentials = new NetworkCredential(username, password),
                        EnableSsl = true
                    };

                    using var mail = new MailMessage(
                        new MailAddress(from!),
                        new MailAddress(customerEmail))
                    {
                        Subject = $"Payment Overdue Reminder – Invoice {sale.InvoiceNumber}",
                        Body = body,
                        IsBodyHtml = true
                    };

                    await client.SendMailAsync(mail);

                    // Mark reminder as sent so we never send again for this sale
                    sale.ReminderSent = true;
                    _logger.LogInformation("[CreditReminder] Reminder sent to {Email} for Sale #{SaleId}.", customerEmail, sale.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[CreditReminder] Failed to send reminder for Sale #{SaleId}.", sale.Id);
                }
            }

            await context.SaveChangesAsync();
        }

        private string GenerateReminderHtml(string invoiceNumber, string customerName, decimal remainingAmount, DateTime dueDate)
        {
            return $@"
            <div style='font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;'>
                <div style='background: #dc2626; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;'>
                    <h2 style='color: white; margin: 0; font-size: 20px;'>⚠ Payment Overdue Notice</h2>
                </div>

                <p style='font-size: 15px; color: #374151;'>Dear <strong>{customerName}</strong>,</p>

                <p style='font-size: 15px; color: #374151;'>
                    This is a reminder that your credit payment for 
                    <strong>Invoice {invoiceNumber}</strong> was due at 
                    <strong style='color: #dc2626;'>{dueDate.ToLocalTime():yyyy-MM-dd HH:mm}</strong> 
                    and remains unpaid.
                </p>

                <div style='background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px 20px; border-radius: 8px; margin: 20px 0;'>
                    <p style='margin: 0; font-size: 14px; color: #7f1d1d;'>
                        <strong>Remaining Balance:</strong> 
                        <span style='font-size: 20px; color: #dc2626;'>NPR {remainingAmount:N2}</span>
                    </p>
                </div>

                <p style='font-size: 15px; color: #374151;'>
                    Please visit our store or contact us to clear your dues at the earliest. 
                    Continued delay may affect your credit standing.
                </p>

                <p style='font-size: 13px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;'>
                    This is an automated reminder from the Inventory Management System.
                </p>
            </div>";
        }
    }
}
