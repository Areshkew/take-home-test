# Fundo Loan Management System

> A full-stack Loan Management System built with **.NET 6**, **Angular 19**, **CQRS + MediatR**, **Clean Architecture**, **JWT Authentication**, and **Tailwind CSS**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | .NET 6, C# 10 |
| **Architecture** | Clean Architecture (Domain → Application → Infrastructure → WebApi) |
| **Patterns** | CQRS with MediatR, Repository + Unit of Work |
| **Data** | EF Core 6, SQL Server 2022 |
| **Auth** | JWT Bearer tokens |
| **Testing** | xUnit, Moq, FluentAssertions, WebApplicationFactory |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI |
| **Frontend** | Angular 19 standalone, Signals, Tailwind CSS v3 |
| **Frontend Architecture** | Domain-Driven Design (Domain → Application → Infrastructure → Presentation) |

---

## Architecture

### Backend

```
backend/src/
├── Fundo.Domain/              # Entities, Value Objects, Domain Events, Enums
├── Fundo.Application/         # CQRS Handlers, DTOs, Interfaces, Validation
├── Fundo.Infrastructure/      # EF Core, Repositories, Migrations, JWT Service
├── Fundo.Applications.WebApi/ # Controllers, Middleware, DI Registration
└── Fundo.Services.Tests/      # Unit + Integration tests
```

**Key patterns:**
- **CQRS**: Commands (writes) and Queries (reads) are separated with dedicated handlers
- **MediatR**: Routes commands/queries to handlers via type matching
- **Repository + UoW**: `ILoanRepository` abstracts persistence; `IUnitOfWork` manages transactions
- **Value Objects**: `Money` enforces currency safety and immutability
- **Domain Events**: `PaymentReceivedDomainEvent` for extensible side effects
- **Global Exception Middleware**: Converts domain exceptions to standardized JSON errors

### Frontend

```
frontend/src/app/
├── domain/                    # Pure TypeScript — no Angular deps
│   ├── entities/              # Loan, Payment with domain behavior
│   ├── value-objects/         # Money (validated, immutable)
│   ├── repositories/          # Ports (interfaces + InjectionTokens)
│   └── enums, errors, models/
├── application/               # Use cases / orchestration
│   └── use-cases/             # ListLoans, CreateLoan, MakePayment, Login...
├── infrastructure/            # HTTP, localStorage, mappers
│   ├── repositories/          # Adapters (implement ports)
│   └── interceptors/
└── presentation/              # Angular components only
    └── components/
```

**Key patterns:**
- **Ports & Adapters**: `LoanRepository` (port) → `HttpLoanRepository` (adapter)
- **Use Cases**: Each feature has a dedicated, testable orchestrator
- **Signals**: Pure Angular signals for reactive state (no NgRx)
- **Tailwind CSS**: Zero Angular Material — fully custom styled UI

---

## Features

### API Endpoints

All loan endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `POST` | `/api/loans` | Create a new loan |
| `GET` | `/api/loans?pageNumber=1&pageSize=10` | Paginated list of loans |
| `GET` | `/api/loans/{id}` | Single loan with payment history |
| `POST` | `/api/loans/{id}/payment` | Apply a payment (idempotency key required) |

**Swagger UI:** http://localhost:5000/swagger/index.html

**Demo credentials:**
- Email: `admin@fundo.com`
- Password: `P@ssw0rd!`

### Domain Rules
- Loan amount must be > 0
- Payment amount must be > 0 and ≤ current balance
- Duplicate payments rejected via `idempotencyKey`
- Fully paid loans transition status to `Paid` automatically
- `Money` value object prevents negative amounts and cross-currency operations

### Frontend Features
- **JWT Auth flow**: Login → token stored → protected routes
- **Reactive table**: Server-side pagination, sticky header, vertical scroll
- **Windowed pagination**: Shows ~7 page numbers with ellipsis (`…`) for large datasets
- **Custom page sizes**: 10, 25, 50, 100, 200 + free-form input up to 1000
- **Inline payments**: Pay button per row expands a payment form inline
- **Payment history**: Expandable per-loan payment detail table
- **Toast notifications**: Bottom-center with success/error/info states
- **Responsive**: Stacks on mobile, horizontal scroll on narrow viewports

---

## Quick Start (Docker)

The fastest way to run the full stack:

```bash
# 1. Clone and navigate to repo root
git clone <your-fork-url>
cd take-home-test

# 2. Start everything (SQL Server + Backend)
docker compose up --build

# 3. In a new terminal, seed test data
node frontend/seed-loans.js

# 4. In another terminal, start the frontend
cd frontend
npm install
npm start
```

**Open:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/swagger/index.html

**Login with:**
- Email: `admin@fundo.com`
- Password: `P@ssw0rd!`

---

## Running Locally (Without Docker)

### Prerequisites
- [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
- [SQL Server](https://www.microsoft.com/sql-server) or [SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads)
- [Node.js 18+](https://nodejs.org/)

### Backend

```bash
cd backend/src

# Restore packages
dotnet restore

# Run migrations (creates database)
dotnet ef database update --project Fundo.Infrastructure --startup-project Fundo.Applications.WebApi

# Seed data on first run (built into DbInitializer)
dotnet run --project Fundo.Applications.WebApi
```

The API will be available at `http://localhost:5000`.

**Run tests:**
```bash
cd backend/src
dotnet test
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

The app will be available at `http://localhost:4200`.

---

## Running Tests

### Backend (38 tests)

```bash
cd backend/src
dotnet test
```

| Category | Count | Coverage |
|---|---|---|
| Unit — Domain | 22 | `Money` VO, `Loan` entity behavior |
| Unit — Handlers | 6 | `CreateLoanCommandHandler`, `MakePaymentCommandHandler` |
| Integration | 10 | Auth, Loan CRUD, payments, idempotency, protected routes |

### Frontend

```bash
cd frontend
npm test        # Karma + Jasmine (if tests added)
npm run build   # Verify production build compiles
```

---

## DevOps

### Docker Compose

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    ports: ["1433:1433"]
    environment:
      SA_PASSWORD: "YourStrong@Passw0rd"
      ACCEPT_EULA: "Y"

  backend:
    build: ./backend
    ports: ["5000:80"]
    depends_on: [sqlserver]
    environment:
      ConnectionStrings__DefaultConnection: "Server=sqlserver;..."
```

### GitHub Actions CI

`.github/workflows/dotnet.yml` runs on every push/PR:
1. Checkout code
2. Setup .NET 6
3. Restore → Build → Test
4. Docker build verification

---

## API Documentation

### Authentication

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fundo.com","password":"P@ssw0rd!"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "admin@fundo.com"
}
```

### Create Loan

```bash
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount":10000,"applicantName":"Alice Cooper"}'
```

### List Loans

```bash
curl "http://localhost:5000/api/loans?pageNumber=1&pageSize=10" \
  -H "Authorization: Bearer <token>"
```

### Apply Payment

```bash
curl -X POST http://localhost:5000/api/loans/{id}/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount":2500,"idempotencyKey":"unique-key-123"}'
```

---

## Seeding Test Data

To populate the database with 200+ loans for pagination testing:

```bash
node frontend/seed-loans.js
```

This creates:
- 200 loans with varied amounts ($5K–$100K)
- ~120 partial payments
- ~30 fully paid-off loans

---

## Design Decisions & Tradeoffs

### SQLite in-memory for integration tests
Integration tests use SQLite in-memory (shared `DbConnection`) instead of spinning up SQL Server in Docker. This provides real relational behavior with EF Core while keeping test execution fast (< 5s) and CI-friendly.

### Signal-based frontend state
The frontend uses Angular signals + `toObservable`/`toSignal` instead of RxJS subscriptions in templates. This reduces boilerplate, eliminates memory leak risks from unsubscribed streams, and aligns with Angular 19's reactive direction.

### No NgRx / Redux
For this scope, signals + use cases provide sufficient state management. Adding NgRx would introduce significant boilerplate without clear ROI for a CRUD-heavy feature set.

### Tailwind over Angular Material
Removed Angular Material entirely (~124 KB saved). All UI is custom Tailwind CSS, giving full design control and eliminating Material's theming complexity.

---

## Future Features & Improvements

Given more time, the following would be natural next steps:

- **CDN Caching**: Cache static loan list responses with Redis + CDN for high-traffic scenarios; implement cache invalidation on payment mutations.
- **Redis caching**: Cache `ListLoans` query results with cache tags for selective invalidation.
- **Rate limiting**: Add ASP.NET Core rate limiting on payment endpoints to prevent abuse.
- **Audit logging**: Log all payment operations to an append-only audit table.
- **Soft deletes**: Implement `IsDeleted` flag on loans instead of hard deletes.
- **Frontend testing**: Add component tests with Angular Testing Library and E2E with Playwright.
- **Real-time updates**: SignalR/WebSocket for live balance updates across clients.
- **Multi-currency support**: Extend `Money` VO with exchange rate integration.
- **Loan approval workflow**: Add `Pending` → `Approved` → `Active` status flow.
- **Background jobs**: Use Hangfire for scheduled payment reminders.

---

## Submission Checklist

- [x] All required endpoints implemented (`POST /loans`, `GET /loans`, `GET /loans/{id}`, `POST /loans/{id}/payment`)
- [x] JWT Authentication implemented (`POST /auth/login`, protected routes, Angular auth flow)
- [x] EF Core + SQL Server with seed data
- [x] Frontend consumes real API with server-side pagination
- [x] Unit and integration tests exist and pass (38 tests)
- [x] Docker + Docker Compose working
- [x] CI/CD pipeline configured (GitHub Actions)
- [x] README with setup instructions
- [x] Clean Architecture with clear project boundaries
- [x] CQRS + MediatR pattern
- [x] Domain modeling (`Money` value object, idempotency keys)
- [x] Frontend DDD architecture

---

## License

This is a take-home test submission. Not licensed for production use.
