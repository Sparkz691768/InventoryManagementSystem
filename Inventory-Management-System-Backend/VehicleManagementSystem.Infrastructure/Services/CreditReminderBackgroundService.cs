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
            <div style='font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>
                <div style='background-color: #ffffff; padding: 20px; border: 1px solid #ddd;'>
                    <h2 style='margin-top: 0;'>Payment Overdue Notice</h2>
                    <p>Dear {customerName},</p>

                    <p>This is a reminder that your credit payment for <strong>Invoice {invoiceNumber}</strong> was due on <strong>{dueDate.ToLocalTime():yyyy-MM-dd HH:mm}</strong> and has not been paid yet.</p>

                    <table border='1' cellpadding='6' cellspacing='0' style='border-collapse: collapse; margin-top: 10px;'>
                        <tr style='background-color: #eeeeee;'>
                            <th align='left'>Invoice</th>
                            <th align='right'>Remaining Amount</th>
                            <th align='left'>Due Date</th>
                        </tr>
                        <tr>
                            <td>{invoiceNumber}</td>
                            <td align='right'>NPR {remainingAmount:N2}</td>
                            <td>{dueDate.ToLocalTime():yyyy-MM-dd}</td>
                        </tr>
                    </table>

                    <br/>
                    <p>Please visit our store or contact us to settle the payment as soon as possible.</p>

                    <hr style='margin-top: 20px;'/>
                    <p style='font-size: 12px; color: #888;'>This is an automated reminder from AutoLaya Inventory Management System.</p>
                </div>
            </div>";
        }
    }
}
