using Microsoft.EntityFrameworkCore;
using VehicleManagementSystem.Application.Interfaces.IRepositories;
using VehicleManagementSystem.Application.Interfaces.IServices;
using VehicleManagementSystem.Infrastructure.Persistence;
using VehicleManagementSystem.Infrastructure.Repositories;
using VehicleManagementSystem.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IVendorRepository, VendorRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Services
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ISaleRepository, SaleRepository>();
builder.Services.AddScoped<ISaleService, SaleService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// Background Service: Credit Due Reminder Emails
builder.Services.AddHostedService<CreditReminderBackgroundService>();

// CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Controllers
builder.Services.AddControllers();

// OpenAPI / Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// AUTOMATIC NEON POSTGRESQL DATABASE SCHEMA PATCHER FOR NEW PAYMENT COLUMNS
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.ExecuteSqlRaw(@"
            ALTER TABLE ""Sales"" ADD COLUMN IF NOT EXISTS ""PaymentStatus"" text;
            ALTER TABLE ""Sales"" ADD COLUMN IF NOT EXISTS ""PaymentMethod"" text;
            ALTER TABLE ""Sales"" ADD COLUMN IF NOT EXISTS ""PaidAmount"" numeric DEFAULT 0;
            ALTER TABLE ""Sales"" ADD COLUMN IF NOT EXISTS ""RemainingAmount"" numeric DEFAULT 0;
            ALTER TABLE ""Sales"" ADD COLUMN IF NOT EXISTS ""DueDate"" timestamp with time zone;
            ALTER TABLE ""Sales"" ADD COLUMN IF NOT EXISTS ""ReminderSent"" boolean DEFAULT false;
        ");
        Console.WriteLine("Neon PostgreSQL Sales table payment columns patched successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Neon PostgreSQL database schema patching error: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();