# FinFamily - Family Financial Control

## Overview

FinFamily is a family financial management application built for tracking income, expenses, accounts, and budgets across family members. The app provides a dashboard with visual charts, transaction management with support for one-time, recurring, and installment payments, account tracking, and family member management with color-coded identification.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Charts**: Recharts for data visualization (pie charts, bar charts)
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API with `/api` prefix
- **Build Tool**: esbuild for server bundling, Vite for client

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)

### Key Data Models
- **Members**: Family members with color identification
- **Categories**: Transaction categories (income/expense) with colors
- **Accounts**: Bank accounts, credit cards, cash, vouchers with balances
- **Transactions**: Financial records with recurrence support (one-time, fixed monthly, installments)
- **Budgets**: Budget tracking per category

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── lib/          # API client, utilities
│   │   └── hooks/        # Custom React hooks
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── index.ts      # Server entry point
├── shared/           # Shared code
│   └── schema.ts     # Drizzle schema definitions
└── migrations/       # Database migrations
```

### API Design
All API endpoints follow REST conventions under `/api`:
- `GET/POST /api/members` - Family member management
- `GET/POST /api/income-types` - Income type management
- `GET/POST /api/income-categories` - Income category management
- `GET/POST /api/expense-types` - Expense type management
- `GET/POST /api/expense-categories` - Expense category management
- `GET/POST /api/accounts` - Financial accounts
- `GET/POST/DELETE /api/transactions` - Transaction (expense) CRUD with filtering
- `GET/POST/DELETE /api/movements` - Movement (income) CRUD with filtering
- `GET/POST /api/budgets` - Budget management

### Pages
- **Dashboard** (`/`) - Financial summary with charts
- **Transações** (`/transactions`) - Expense management
- **Contas** (`/accounts`) - Account management
- **Família** (`/family`) - Family member management
- **Configurações** (`/settings`) - Settings for income types and categories

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Libraries
- **Radix UI**: Headless UI primitives (dialogs, dropdowns, forms, etc.)
- **Lucide React**: Icon library
- **Recharts**: Charting library for dashboard visualizations
- **date-fns**: Date formatting and manipulation

### Build & Development
- **Vite**: Frontend development server and bundler
- **esbuild**: Server-side TypeScript bundling
- **Drizzle Kit**: Database migration tooling (`npm run db:push`)

### Validation
- **Zod**: Schema validation for API requests
- **drizzle-zod**: Generates Zod schemas from Drizzle table definitions
- **zod-validation-error**: Human-readable validation error messages