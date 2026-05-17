# Alliance University ERP Portal (AUERP)

A full-stack university management system for Alliance University — providing separate portals for Students, Faculty/Staff, and Administrators with role-based access, dashboards, academic features, and secure authentication.

---

## Live Features

### Student Portal (`/login`)
- Enrollment-number + password login with CAPTCHA
- **Dashboard** — attendance summary, fee alerts, recent results, upcoming exams
- **Fee Management** — view outstanding dues, download payment receipts
- **Attendance** — subject-wise attendance percentage with visual indicators
- **Exam Forms** — submit/track semester exam registration
- **Hall Tickets** — download admit cards with subject schedule
- **Results & Marksheets** — semester-wise results with SGPA/CGPA
- **Notifications** — priority-based announcements from admin
- **Academic Calendar** — exams, holidays, deadlines by month
- **ID Card** — digital student identity card
- **Profile** — personal and academic details

### Faculty / Staff Portal (`/staff`)
- Employee-ID + password login with CAPTCHA
- **Dashboard** — quick stats overview
- **Student Management** — view enrolled students
- **Exam Form Management** — review and approve student exam submissions

### Admin Portal (`/admin`)
- Admin-ID + password login with CAPTCHA
- **Dashboard** — university-wide statistics
- **Student Management** — full CRUD on student records
- **Staff Management** — manage faculty/staff accounts
- **Fee Management** — view and manage fee records
- **Exam Forms** — approve / reject submissions
- **Notifications** — broadcast announcements to students or staff

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Session-based (express-session) |
| Validation | Zod (v4), drizzle-zod |
| API Contract | OpenAPI 3.0 → Orval codegen |
| HTTP Client | TanStack React Query + generated hooks |
| Routing | Wouter |
| Package Manager | pnpm workspaces (monorepo) |

---

## Repository Structure

```
auerp1/
├── artifacts/
│   ├── university-portal/          # React + Vite frontend
│   │   ├── public/                 # Static assets (campus images)
│   │   └── src/
│   │       ├── components/         # Reusable UI & layout components
│   │       ├── hooks/              # Auth hook, mobile hook
│   │       └── pages/
│   │           ├── auth/           # Login pages (student, staff, admin)
│   │           ├── student/        # All student-facing pages
│   │           ├── staff/          # Staff pages
│   │           └── admin/          # Admin pages
│   └── api-server/                 # Express 5 API server
│       └── src/
│           ├── routes/             # Route handlers per domain
│           ├── middlewares/        # Session auth middleware
│           └── lib/                # DB connection, logger
├── lib/
│   ├── db/                         # Drizzle ORM schema & migrations
│   ├── api-spec/                   # OpenAPI spec + Orval config
│   ├── api-client-react/           # Generated React Query hooks
│   └── api-zod/                    # Generated Zod schemas
└── scripts/                        # Utility / seed scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **pnpm** v9 or higher (`npm install -g pnpm`)
- **PostgreSQL** 14 or higher (running locally or remote)

### 1. Clone the Repository

```bash
git clone https://github.com/Barela08/auerp1.git
cd auerp1
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the **project root** (and/or in `artifacts/api-server/`):

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/auerp

# Session secret (use a long random string in production)
SESSION_SECRET=your_super_secret_session_key_here
```

> **Never commit `.env` to Git.** It is listed in `.gitignore`.

### 4. Set Up the Database

Push the Drizzle schema to your PostgreSQL database:

```bash
pnpm --filter @workspace/db run push
```

Seed demo data (students, staff, fees, results, etc.):

```bash
pnpm --filter @workspace/scripts run seed
```

### 5. Start Development Servers

**API Server** (port 8080):
```bash
pnpm --filter @workspace/api-server run dev
```

**Frontend** (port determined by `PORT` env var):
```bash
pnpm --filter @workspace/university-portal run dev
```

Or run both together if you have a process manager like `concurrently`:
```bash
pnpm run dev
```

---

## API Endpoints

All API endpoints are prefixed with `/api`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login (student / staff / admin) |
| POST | `/api/auth/logout` | Logout current session |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/students` | List all students (admin) |
| GET | `/api/students/:id` | Get student details |
| GET | `/api/fees` | Get fee records |
| GET | `/api/attendance` | Get attendance records |
| GET | `/api/exam-forms` | List exam form submissions |
| PATCH | `/api/exam-forms/:id` | Update exam form status |
| GET | `/api/hall-tickets` | Get hall tickets |
| GET | `/api/results` | Get exam results |
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications` | Create notification (admin) |
| GET | `/api/calendar` | Get academic calendar events |
| GET | `/api/dashboard` | Get dashboard summary stats |

---

## Regenerating API Client Code

If you modify the OpenAPI spec (`lib/api-spec/openapi.yaml`), regenerate the client:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates:
- React Query hooks → `lib/api-client-react/src/generated/`
- Zod schemas → `lib/api-zod/src/generated/`

---

## Database Schema

The database is defined in `lib/db/src/schema.ts` using Drizzle ORM. Key tables:

| Table | Description |
|---|---|
| `users` | Authentication accounts (student / staff / admin) |
| `students` | Student profile data |
| `staff` | Faculty/staff profile data |
| `fees` | Fee records and payment status |
| `attendance` | Subject-wise attendance |
| `exam_forms` | Exam registration submissions |
| `hall_tickets` | Admit card data |
| `results` | Semester results and marksheets |
| `notifications` | Broadcast announcements |
| `calendar_events` | Academic calendar entries |
| `documents` | Uploaded document records |

---

## Demo Credentials

> These are for development/testing only.

| Role | Username | Password |
|---|---|---|
| Student | `RTUBETCH-CS/2024-25/020` | `student123` |
| Staff | `EMP001` | `staff123` |
| Admin | `admin` | `admin123` |

---

## Login URLs

| Portal | URL |
|---|---|
| Student | `/login` |
| Faculty / Staff | `/staff` |
| Admin | `/admin` |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret key for session signing |
| `PORT` | Auto | Port for API server (default 8080) |
| `NODE_ENV` | No | `development` or `production` |

---

## Security Notes

- Passwords are hashed using **bcrypt** before storage
- Sessions are server-side with a signed cookie (HTTP-only)
- CAPTCHA validation on all login forms
- Role-based route protection — students cannot access admin routes
- Environment variables managed via `.env` (never committed)
- Input validation with **Zod** on all API endpoints

---

## Build for Production

```bash
# Type-check everything
pnpm run typecheck

# Build all packages
pnpm run build
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is developed for Alliance University internal use.

---

*Built with React, Express, PostgreSQL, and Drizzle ORM.*
