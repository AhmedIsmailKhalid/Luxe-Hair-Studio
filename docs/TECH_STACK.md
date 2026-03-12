# Technology Stack — Luxe Hair Studio

## Frontend
| Layer | Technology | Justification |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, modern React features, industry standard |
| Language | TypeScript | Type safety, better DX, production-grade code |
| Styling | Tailwind CSS v3 | Utility-first, consistent design system |
| Component Library | shadcn/ui | Accessible, unstyled-by-default, fully customizable |
| Routing | React Router v6 | Client-side routing, nested layouts |
| State Management | Zustand | Lightweight, minimal boilerplate for booking state |
| Forms | React Hook Form + Zod | Performant forms with schema-based validation |
| Date/Time | date-fns | Lightweight, tree-shakeable date utility |
| HTTP Client | Axios | Interceptors for auth tokens, consistent error handling |
| Notifications | sonner | Lightweight toast notifications (shadcn-compatible) |

## Backend
| Layer | Technology | Justification |
|---|---|---|
| Runtime | Node.js 20 LTS | Stable, widely supported |
| Framework | Express.js | Minimal, flexible, production-proven |
| Language | TypeScript | Consistent with frontend, type-safe APIs |
| ORM | Prisma | Type-safe DB queries, clean migrations, Supabase-compatible |
| Validation | Zod | Shared schema validation between frontend and backend |
| Email | Nodemailer + SMTP / Resend | Booking confirmation emails |
| Logging | Winston | Structured logging, log levels, file + console transport |
| Environment Config | dotenv + envalid | Validated environment variables, no silent misconfigs |

## Database & Auth
| Layer | Technology | Justification |
|---|---|---|
| Database | PostgreSQL (via Supabase) | Relational, ACID-compliant, industry standard |
| Auth Provider | Supabase Auth | JWT-based, session management, secure out of the box |
| ORM Layer | Prisma | Connects to Supabase Postgres with type-safe queries |

## Dev Tooling
| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code quality and formatting enforcement |
| Husky + lint-staged | Pre-commit hooks |
| Vitest | Unit and integration testing (frontend) |
| Supertest | API endpoint testing (backend) |
| Postman / Bruno | API development and manual testing |

## Hosting
| Layer | Platform |
|---|---|
| Frontend | Vercel (free tier) |
| Backend | Railway or Render (free/low-cost tier) |
| Database + Auth | Supabase (free tier) |