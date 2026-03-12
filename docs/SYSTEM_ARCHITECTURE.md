# System Architecture — Luxe Hair Studio

## Overview

Three-tier architecture: React SPA frontend, Express REST API backend,
PostgreSQL database with Supabase managing auth and the DB instance.

## Architecture Diagram
```
┌─────────────────────────────────────────────┐
│                  CLIENT LAYER               │
│                                             │
│  React + Vite SPA                           │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐   │
│  │  Public  │ │ Booking  │ │   Admin    │   │
│  │  Pages   │ │  Wizard  │ │  Dashboard │   │
│  └──────────┘ └──────────┘ └────────────┘   │
│         │            │            │         │
│         └────────────┼────────────┘         │
│                      │                      │
│              Axios HTTP Client              │
│           (JWT token interceptor)           │
└──────────────────────┼──────────────────────┘
                       │
                       │ HTTPS REST
                       |
┌──────────────────────┼──────────────────────┐
│              API LAYER (Express)            │
│                      │                      │
│  ┌─────────────────────────────────────┐    │
│  │           Express Router            │    │
│  │  /api/bookings  /api/services       │    │
│  │  /api/staff     /api/availability   │    │
│  │  /api/admin     /api/auth           │    │
│  └─────────────────────────────────────┘    │
│         │                    │              │
│  ┌──────────────┐   ┌──────────────────┐    │
│  │  Middleware  │   │  Business Logic  │    │
│  │  - Auth JWT  │   │  - Availability  │    │
│  │  - Rate limit│   │  - Booking rules │    │
│  │  - Logging   │   │  - Notifications │    │
│  │  - Validation│   │  - Email trigger │    │
│  └──────────────┘   └──────────────────┘    │
│                      │                      │
│              Prisma ORM Client              │
└──────────────────────┼──────────────────────┘
                       │
                       │
                       │
┌──────────────────────┼──────────────────────┐
│              DATA LAYER (Supabase)          │
│                      │                      │
│  ┌──────────────────────────────────────┐   │
│  │         PostgreSQL Database          │   │
│  │  bookings | services | staff         │   │
│  │  time_slots | customers | reviews    │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │          Supabase Auth               │   │
│  │  Admin JWT issuance + validation     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. SPA + REST API (not SSR)
Client is a pure SPA. No server-side rendering needed — this is a booking
app, not SEO-critical content. Simpler deployment, clear separation of concerns.

### 2. Express as API Gateway
Even though Supabase offers auto-generated REST APIs, we write our own
Express layer. This gives us:
- Custom business logic (booking conflict detection, availability windows)
- Proper error handling and logging
- Control over what the client can and cannot access

### 3. Prisma over Raw SQL or Supabase JS Client for DB
Prisma provides a type-safe query layer with schema-driven migrations.
Keeps the backend code maintainable and refactorable.

### 4. Zustand for Client State
Booking wizard state (selected service → selected stylist → selected time →
confirm) is managed in a Zustand store. Avoids prop drilling across the
multi-step wizard and is trivially testable.

### 5. Zod Shared Schemas
Validation schemas defined once in a shared `packages/schemas` or
`shared/` folder and consumed by both frontend (React Hook Form) and
backend (Express middleware). Single source of truth for data shape.

## Data Flow — Booking Creation
```
User selects service
       │
       ▼
GET /api/services → returns available services
       │
       ▼
User selects stylist + date
       │
       ▼
GET /api/availability?staffId=X&date=Y → returns open time slots
       │
       ▼
User selects time slot + enters details
       │
       ▼
POST /api/bookings → validate → conflict check → create booking
       │
       ▼
Email confirmation triggered (Nodemailer/Resend)
       │
       ▼
Booking confirmation page rendered
```

## Security Model

- Admin routes protected by Supabase JWT verification middleware
- Public booking endpoints rate-limited (express-rate-limit)
- All inputs validated via Zod before reaching business logic
- Environment secrets never exposed to client bundle
- CORS configured to whitelist only known frontend origins