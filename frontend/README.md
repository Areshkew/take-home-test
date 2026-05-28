# Fundo Frontend

Angular 19 standalone app with Tailwind CSS and Domain-Driven Design architecture.

## Architecture

```
src/app/
├── domain/          # Pure TypeScript — entities, value objects, repository ports
├── application/     # Use cases (orchestration layer)
├── infrastructure/  # HTTP adapters, mappers, interceptors
└── presentation/    # Angular components only
```

## Quick Start

```bash
npm install
npm start
```

App: http://localhost:4200

## Build

```bash
npm run build     # Production build
```

Bundle size: ~303 KB initial, ~17 KB lazy-loaded loans chunk.

## Seed Test Data

```bash
# With backend running on :5000
node seed-loans.js
```

Creates 200 loans with varied payments for pagination testing.
