using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using Fundo.Application.Commands;
using Fundo.Application.Interfaces;
using Fundo.Application.Mappings;
using Fundo.Application.Queries;
using Fundo.Domain.Interfaces;
using Fundo.Infrastructure.Persistence;
using Fundo.Infrastructure.Repositories;
using Fundo.Infrastructure.Services;
using Fundo.Applications.WebApi.Middleware;
using FluentValidation;

namespace Fundo.Applications.WebApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // EF Core
            services.AddDbContext<LoanDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            // Repositories & Unit of Work
            services.AddScoped<ILoanRepository, LoanRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Auth
            services.AddScoped<IAuthService, JwtAuthService>();

            // MediatR
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateLoanCommand).Assembly));

            // AutoMapper
            services.AddAutoMapper(typeof(MappingProfile).Assembly);

            // FluentValidation
            services.AddValidatorsFromAssembly(typeof(CreateLoanCommand).Assembly);

            // JWT Authentication
            var jwtKey = Configuration["Jwt:Key"]!;
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidAudience = Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                        ClockSkew = TimeSpan.Zero
                    };
                });

            services.AddAuthorization();

            // CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAngular", policy =>
                {
                    policy.WithOrigins("http://localhost:4200")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            // Health Checks
            services.AddHealthChecks()
                .AddDbContextCheck<LoanDbContext>("database");

            // Swagger
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Fundo API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter JWT with Bearer into field (e.g. 'Bearer abc123')",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fundo API v1"));
            }

            app.UseMiddleware<GlobalExceptionMiddleware>();

            app.UseRouting();
            app.UseCors("AllowAngular");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health");
                endpoints.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
                {
                    Predicate = check => check.Tags.Contains("database")
                });
            });
        }
    }
}
