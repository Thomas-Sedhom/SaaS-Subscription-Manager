# SaaS Subscription Manager Server Architecture

## Overview
This backend is a modular monolith built with Node.js, Express, and TypeScript. It uses Prisma for data access, Supabase Postgres for persistence, DTO-based request validation with `class-validator`, and cookie-based JWT authentication.

## Folder Structure
```text
server/
  prisma/
    schema.prisma
    migrations/
  src/
    app.ts
    server.ts
    routes.ts
    config/
      env.ts
      app.config.ts
    docs/
      swagger-document.ts
      swagger.ts
    shared/
      database/
        prisma.ts
        prisma-mappers.ts
      errors/
        app-error.ts
        error-handler.ts
      middlewares/
        auth.middleware.ts
        not-found.middleware.ts
        role.middleware.ts
        validate.middleware.ts
      utils/
        api-response.ts
        async-handler.ts
        pagination.ts
      constants/
        http-status.ts
        messages.ts
      types/
        common.types.ts
        express.d.ts
    modules/
      admin/
      auth/
      payment-methods/
      payments/
      plans/
      subscriptions/
      users/
```

## Module Template
Each business module follows the same internal shape:

```text
module-name/
  module.routes.ts
  module.controller.ts
  module.service.ts
  module.repository.ts
  module.types.ts
  dto/
    create-*.dto.ts
    update-*.dto.ts
```

## Layer Responsibilities
- `routes`: define endpoints, attach middleware, and forward requests to controllers.
- `controller`: translate HTTP requests into service calls and send formatted responses.
- `service`: enforce business rules and coordinate cross-module workflows.
- `repository`: isolate Prisma queries from the service layer.
- `dto`: define request payload validation classes.
- `types`: hold module-specific response contracts and helper interfaces.
- `shared`: contains reusable cross-cutting infrastructure.
- `docs`: centralizes the OpenAPI document and Swagger UI wiring.
- `config`: centralizes environment loading and application configuration.

## Persistence Strategy
- Prisma models are defined in `prisma/schema.prisma`.
- Database migrations live under `prisma/migrations/`.
- Runtime queries use the shared Prisma client in `src/shared/database/prisma.ts`.
- Mapping helpers in `src/shared/database/prisma-mappers.ts` normalize Prisma records into API-facing response shapes.

## Request Lifecycle
1. A request enters through `src/app.ts`.
2. Global middleware applies security headers, CORS, JSON parsing, and cookie parsing.
3. `src/routes.ts` mounts the versioned API router under `/api/v1`.
4. Module routes apply authentication, role checks, and DTO validation when needed.
5. Controllers delegate use cases to services.
6. Services enforce business rules and call repositories.
7. Repositories read and write through Prisma.
8. Controllers return standardized success payloads through shared response helpers.
9. Any `AppError` or unexpected failure is normalized by the global error handler.

## API Documentation
- Swagger UI is served at `/docs`.
- The raw OpenAPI JSON document is available at `/docs.json`.
- The OpenAPI source of truth lives in `src/docs/swagger-document.ts`.

## Shared vs Module-Specific Rules
- Put code in `shared/` only when it is reused across multiple modules.
- Keep business logic, DTOs, and workflows inside the owning module.
- Keep Prisma usage inside repositories.
- Keep auth and role middleware generic; module-specific rules should stay in services.

## Naming Conventions
- File names use kebab-case with a role suffix such as `auth.service.ts` or `update-plan.dto.ts`.
- Classes use PascalCase.
- Variables, functions, and object keys use camelCase.
- Route groups use plural resource names such as `/users`, `/plans`, and `/subscriptions`.
- DTOs are named `CreateXDto`, `UpdateXDto`, or another request-specific descriptive name.

## Environment and Config Strategy
Environment variables are documented in `.env.example` and loaded through `config/env.ts`.
Application-wide constants such as the API prefix live in `config/app.config.ts`.
Key runtime values include:
- `PORT`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

## Core Business Modules
- `auth`: signup, login, logout, and current-user session lookup.
- `users`: profile management plus admin-only user listing and detail lookup.
- `plans`: plan catalog queries and admin-protected plan mutations.
- `subscriptions`: plan selection, checkout, cancellation, and plan changes.
- `payments`: payment history and payment processing orchestration.
- `payment-methods`: saved card management for checkout.
- `admin`: dashboard statistics and administrator creation.

