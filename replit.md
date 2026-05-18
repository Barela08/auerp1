# Alliance University ERP Portal (AUERP)

Full-stack university management portal with role-based dashboards for Student, Staff, and Admin.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 9000)
- `pnpm --filter @workspace/university-portal run dev` — run the frontend (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — re-seed the database (truncates first)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (port 8080)
- API: Express 5 (port 9000)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/university-portal/` — React frontend
- `artifacts/api-server/` — Express backend
- `lib/db/` — Drizzle ORM schema + DB connection
- `scripts/src/seed.ts` — Demo data seeding
- `artifacts/university-portal/public/` — Static assets (logos, backgrounds)

## Demo Credentials

| Role    | Email                        | Password   |
|---------|------------------------------|------------|
| Student | barelanilesh483@gmail.com    | Nilu@2006  |
| Staff   | ramesh.kumar@alliance.edu    | Staff@2024 |
| Staff   | teacher@alliance.edu.in      | password123|
| Admin   | admin@alliance.edu           | Admin@2024 |
| Admin   | admin@alliance.edu.in        | password123|

## Routes

- `/` or `/login` — Student login
- `/staff` — Staff login
- `/admin` — Admin login
- `/student/dashboard` — Student portal (after login)
- `/staff/dashboard` — Staff portal
- `/admin/dashboard` — Admin portal

## Architecture decisions

- Plain-text password comparison (no bcrypt) — intentional for demo simplicity
- Auth matches on both email AND username fields
- Profile photo + signature stored as base64 data URLs in DB
- Attendance date-wise records fetched on-demand per subject (click-to-expand)
- All document headers use horizontal logo; round seal used as background watermark only

## Product

- Student portal: Dashboard, Profile (photo+signature upload), Fees, Hall Ticket, Attendance (with date-wise detail), Results/Marksheet, Notifications, ID Card, Documents (Bonafide/Character Cert), Calendar
- Staff portal: Dashboard, Students list, Exam Forms, Calendar, Notifications
- Admin portal: Dashboard, Students, Staff, Fees, Results, Exam Forms, Calendar, Notifications, Branding

## User preferences

- Use horizontal logo (`/au-logo-horizontal.png`) as main logo on all documents and login pages
- Round seal logo (`/au-logo-round.png`) only as background watermark at low opacity (~0.04)
- Campus background for login pages: `/campus-bg2.jpg` (staff/admin), `/campus-bg1.jpg` (student)
- No "Online University" or unwanted text in printed/downloaded documents
- All credentials shown in demo section must be clickable to auto-fill

## Gotchas

- After DB schema changes, run `pnpm --filter @workspace/db run push`
- After adding new users directly to DB, no need to reseed
- `attached_assets/` is NOT web-served — copy files to `artifacts/university-portal/public/` first
- `branding` context keys: `logo_round`, `logo_horizontal`, `staff_login_bg`, `admin_login_bg`
