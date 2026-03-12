# Implementation Roadmap — Luxe Hair Studio

## Phase 0 — Project Setup & Infrastructure
> Goal: Runnable skeleton, tooling configured, environments connected

- [ ] Initialize React + Vite + TypeScript frontend
- [ ] Initialize Node + Express + TypeScript backend
- [ ] Configure ESLint, Prettier, Husky across both
- [ ] Set up Tailwind CSS + shadcn/ui in frontend
- [ ] Create Supabase project (DB + Auth)
- [ ] Configure Prisma with Supabase PostgreSQL connection
- [ ] Define initial Prisma schema (core tables)
- [ ] Run first migration, verify DB connection
- [ ] Configure environment variables (dotenv + envalid)
- [ ] Set up Winston logger in backend
- [ ] Verify frontend ↔ backend ↔ DB full connection

## Phase 1 — Data Models & API Foundation
> Goal: Core data layer and API routes working, testable via Postman

**Database Models:**
- [ ] `Service` (name, duration, price, description, category)
- [ ] `Staff` (name, bio, avatar, specialties)
- [ ] `TimeSlot` (staffId, date, startTime, endTime, isAvailable)
- [ ] `Customer` (name, email, phone)
- [ ] `Booking` (customerId, serviceId, staffId, timeSlotId, status, notes)

**API Routes:**
- [ ] `GET /api/services` — list all services
- [ ] `GET /api/staff` — list all staff
- [ ] `GET /api/availability` — query open slots by staff + date
- [ ] `POST /api/bookings` — create booking with conflict check
- [ ] `GET /api/bookings/:id` — retrieve booking by ID + confirmation token
- [ ] `PATCH /api/bookings/:id/cancel` — customer self-cancellation

**Middleware:**
- [ ] Request validation middleware (Zod)
- [ ] Error handling middleware (consistent error response shape)
- [ ] Rate limiting on public routes
- [ ] Request logging (Winston)

## Phase 2 — Public Frontend (Customer-Facing)
> Goal: A customer can land on the site and complete a booking end-to-end

**Pages:**
- [ ] Home / Landing page (hero, services overview, CTAs)
- [ ] Services page (service cards with details)
- [ ] Booking Wizard (multi-step: service → stylist → date/time → details → confirm)
- [ ] Booking Confirmation page

**Components:**
- [ ] Navbar + Footer
- [ ] ServiceCard
- [ ] StaffCard
- [ ] BookingWizard (step controller)
  - [ ] Step 1: ServiceSelector
  - [ ] Step 2: StaffSelector
  - [ ] Step 3: DateTimePicker (calendar + available slots)
  - [ ] Step 4: CustomerDetailsForm
  - [ ] Step 5: ReviewAndConfirm
- [ ] BookingConfirmation
- [ ] LoadingSpinner / Skeleton states
- [ ] ErrorBoundary

**State:**
- [ ] Zustand booking store (wizard state, selected items)

## Phase 3 — Notifications & Email
> Goal: Customers receive confirmation and reminder emails

- [ ] Email service setup (Resend or Nodemailer + SMTP)
- [ ] Booking confirmation email template (HTML)
- [ ] Booking reminder email (24h before appointment)
- [ ] Cancellation confirmation email
- [ ] Email trigger integration in booking creation flow

## Phase 4 — Admin Dashboard
> Goal: Studio owner can manage bookings, staff, services, and availability

**Auth:**
- [ ] Admin login page (Supabase Auth)
- [ ] JWT middleware protecting all /api/admin routes
- [ ] Protected route wrapper in frontend

**Admin Pages:**
- [ ] Dashboard overview (today's bookings, stats)
- [ ] Bookings management (list, filter, status update)
- [ ] Booking detail view + manual status update
- [ ] Services management (CRUD)
- [ ] Staff management (CRUD + working hours)
- [ ] Availability / schedule management

## Phase 5 — Polish, Testing & Deployment
> Goal: Production-ready, deployed, portfolio-presentable

- [ ] Responsive design audit (mobile-first)
- [ ] Accessibility audit (keyboard nav, aria labels)
- [ ] Vitest unit tests: Zustand store, utility functions
- [ ] Supertest API tests: all core booking routes
- [ ] Loading states and error states on all async operations
- [ ] SEO basics (meta tags, Open Graph)
- [ ] Deploy frontend → Vercel
- [ ] Deploy backend → Railway or Render
- [ ] Point to Supabase production DB
- [ ] Final end-to-end smoke test