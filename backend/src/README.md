# Fundo Backend

.NET 6 Web API built with Clean Architecture, CQRS + MediatR, and EF Core.

## Architecture

```
src/
├── Fundo.Domain/               # Entities, Value Objects, Domain Events
├── Fundo.Application/          # CQRS Handlers, DTOs, Validation
├── Fundo.Infrastructure/       # EF Core, Repositories, Migrations, JWT
├── Fundo.Applications.WebApi/  # Controllers, Middleware, DI
└── Fundo.Services.Tests/       # Unit + Integration tests
```

## Quick Start

```bash
# From backend/src/
dotnet restore
dotnet ef database update --project Fundo.Infrastructure --startup-project Fundo.Applications.WebApi
dotnet run --project Fundo.Applications.WebApi
```

API: http://localhost:5000  
Swagger: http://localhost:5000/swagger/index.html

## Testing

```bash
dotnet test
```

38 tests: 22 domain unit tests, 6 handler unit tests, 10 integration tests.

## Migrations

```bash
# Add a new migration
dotnet ef migrations add MigrationName --project Fundo.Infrastructure --startup-project Fundo.Applications.WebApi

# Update database
dotnet ef database update --project Fundo.Infrastructure --startup-project Fundo.Applications.WebApi
```
