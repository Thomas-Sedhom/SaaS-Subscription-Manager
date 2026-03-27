# SaaS Subscription Manager Server Architecture

## Overview
This backend is a modular monolith built with Node.js, Express, and TypeScript. The HTTP layer, business logic, and repository layer are still separated, but the persistence implementation is temporarily backed by an in-memory store until we finalize the database schema together.

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
      db.config.ts
    shared/
      database/
        in-memory-store.ts
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
      auth/
      users/
      plans/
      subscriptions/
      payments/
      admin/
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
  middlewares/
```

## Layer Responsibilities
- `routes`: define endpoints, attach middleware, and forward requests to controllers.
- `controller`: translate HTTP requests into service calls and send formatted responses.
- `service`: contain business rules, orchestration, and cross-entity decisions.
- `repository`: isolate data access so storage details do not leak into controllers or services.
- `dto`: define request payload validation classes using `class-validator`.
- `types`: hold module-specific interfaces and helper contracts.
- `shared`: contains reusable cross-cutting infrastructure used by multiple modules.
- `config`: centralizes environment values and application settings.

## Current Persistence State
The schema discussion is still pending.
For now:
- `prisma/schema.prisma` is intentionally blank.
- repositories use `shared/database/in-memory-store.ts` as a temporary implementation.
- no production database contract should be inferred from the current placeholder store.

## Request Lifecycle
1. A request enters through `src/routes.ts` under the `/api/v1` prefix.
2. Module routes apply authentication, role checks, and DTO validation as needed.
3. The controller receives validated input and delegates the use case to the service.
4. The service enforces business rules and calls the repository.
5. The repository reads/writes through the temporary shared in-memory store.
6. The controller returns a standardized response through shared response helpers.
7. Any thrown `AppError` or unexpected error is normalized by the global error handler.

## Shared vs Module-Specific Rules
- Put code in `shared/` only when it is genuinely reusable across multiple modules.
- Keep feature-specific rules, DTOs, and data flows inside the owning module.
- Avoid leaking storage details outside repositories.
- Replace the in-memory store with Prisma once the schema is agreed.

## Naming Conventions
- File names use kebab-case with a role suffix such as `auth.service.ts` or `update-plan.dto.ts`.
- Classes use PascalCase.
- Variables, functions, and object keys use camelCase.
- Route groups use plural resource names such as `/users`, `/plans`, and `/subscriptions`.
- DTOs are named `CreateXDto`, `UpdateXDto`, or another request-specific descriptive name.

## Environment and Config Strategy
Environment variables are documented in `.env.example` and loaded through `config/env.ts`.
Application-level settings such as API prefix live in `config/app.config.ts`.
Database configuration is intentionally deferred until the schema discussion is complete.

## Initial Business Modules
- `auth`: registration, login, and current-user access.
- `users`: profile management and admin-driven user listing/creation.
- `plans`: plan CRUD-style management with admin-protected mutations.
- `subscriptions`: subscription creation and status/plan changes.
- `payments`: mock payment processing and payment history.
- `admin`: dashboard statistics and administrative entry points.