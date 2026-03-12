# Directory Structure — Luxe Hair Studio

## Repository Layout
```
luxe-hair-studio/
├── frontend/                   # React + Vite SPA
├── backend/                    # Node + Express API
├── shared/                     # Shared types and Zod schemas
└── README.md
```

## Frontend
```
frontend/
├── public/
│   └── assets/                 # Static assets (logo, favicon, images)
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components (auto-generated)
│   │   ├── common/             # Shared app components (Navbar, Footer, etc.)
│   │   ├── booking/            # Booking wizard step components
│   │   ├── services/           # Service-related display components
│   │   ├── staff/              # Staff profile components
│   │   └── admin/              # Admin dashboard components
│   ├── pages/
│   │   ├── public/             # Customer-facing pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   └── ConfirmationPage.tsx
│   │   └── admin/              # Admin pages (protected)
│   │       ├── AdminLoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── BookingsPage.tsx
│   │       ├── ServicesPage.tsx
│   │       └── StaffPage.tsx
│   ├── store/
│   │   ├── bookingStore.ts     # Zustand booking wizard state
│   │   └── authStore.ts        # Zustand admin auth state
│   ├── hooks/
│   │   ├── useBooking.ts       # Booking API interactions
│   │   ├── useServices.ts      # Services fetching
│   │   ├── useAvailability.ts  # Availability queries
│   │   └── useAuth.ts          # Admin auth hook
│   ├── lib/
│   │   ├── axios.ts            # Axios instance + interceptors
│   │   ├── supabase.ts         # Supabase client (auth only)
│   │   └── utils.ts            # shadcn utility (cn function) + helpers
│   ├── types/
│   │   └── index.ts            # Frontend-specific types (re-exports shared)
│   ├── config/
│   │   └── constants.ts        # App-level constants (API URL, etc.)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.local
├── index.html
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Backend
```
backend/
├── src/
│   ├── routes/
│   │   ├── services.routes.ts
│   │   ├── staff.routes.ts
│   │   ├── availability.routes.ts
│   │   ├── bookings.routes.ts
│   │   └── admin.routes.ts
│   ├── controllers/
│   │   ├── services.controller.ts
│   │   ├── staff.controller.ts
│   │   ├── availability.controller.ts
│   │   ├── bookings.controller.ts
│   │   └── admin.controller.ts
│   ├── services/               # Business logic layer
│   │   ├── booking.service.ts  # Conflict detection, booking creation
│   │   ├── availability.service.ts
│   │   └── email.service.ts    # Email trigger logic
│   ├── middleware/
│   │   ├── auth.middleware.ts  # Supabase JWT verification
│   │   ├── validate.middleware.ts  # Zod validation middleware
│   │   ├── rateLimit.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── supabase.ts         # Supabase admin client
│   │   └── logger.ts           # Winston logger instance
│   ├── config/
│   │   └── env.ts              # envalid environment validation
│   └── server.ts               # Express app entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Prisma migration history
├── tests/
│   ├── routes/                 # Supertest route tests
│   └── services/               # Unit tests for business logic
├── .env
├── tsconfig.json
└── package.json
```

## Shared
```
shared/
├── schemas/
│   ├── booking.schema.ts       # Zod schema for booking (used FE + BE)
│   ├── service.schema.ts
│   ├── staff.schema.ts
│   └── customer.schema.ts
└── types/
    └── index.ts                # Shared TypeScript interfaces
```