# 🧾 GenVouchr — Expense Voucher Management System

> A full-stack, role-based expense compliance platform built with Next.js, PostgreSQL (Neon), and Prisma ORM. Employees file reimbursement claims with digital signatures, directors review and authorize, and accounts teams audit the complete financial ledger.

**🌐 Live Demo:** [genvouchr.vercel.app](https://genvouchr.vercel.app)  
**👤 Author:** Om Narkhede

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Test Credentials](#-test-credentials)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Local Setup Instructions](#-local-setup-instructions)
- [Assumptions Made](#-assumptions-made)
- [Project Structure](#-project-structure)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js (App Router) with React 19 |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Prisma ORM v7 with Neon Adapter |
| **Styling** | Tailwind CSS v4 |
| **Form Handling** | React Hook Form + Zod validation |
| **Authentication** | Custom JWT (jose) with HTTP-only cookies |
| **Password Hashing** | bcryptjs (12 salt rounds) |
| **File Uploads** | Local filesystem (`public/uploads/`) via API route |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## ✨ Features

### Role-Based Access Control (RBAC)

The system implements three distinct user roles, each with their own dedicated workspace:

| Role | Workspace | Capabilities |
|------|-----------|-------------|
| **Employee** | Claimant Portal | Create, edit, delete draft vouchers · Attach receipt images · Submit with digital signature · Manage saved signature profile |
| **Director** | Manager Dashboard | View pending voucher queue · Inspect receipt attachments · Approve with director counter-signature · Reject with mandatory compliance reason |
| **Accounts** | Financial Ledger | Read-only global audit ledger · Search & filter by status, date, amount · Sort columns · Export CSV reports |

### Voucher State Machine

Vouchers follow a strict, one-directional state machine enforced at the server level:

```
┌─────────┐     Submit      ┌─────────┐     Approve     ┌──────────┐
│  DRAFT  │ ──────────────► │ PENDING │ ──────────────► │ APPROVED │
└─────────┘   (+ Employee   └─────────┘   (+ Director   └──────────┘
               Signature)        │          Signature)
                                 │
                                 │  Reject
                                 │  (+ Reason)
                                 ▼
                            ┌──────────┐
                            │ REJECTED │
                            └──────────┘
```

- **DRAFT** → Only the owning employee can edit, delete, or submit
- **PENDING** → Locked from edits; awaiting director review
- **APPROVED** → Immutable; contains both employee + director signatures and approval timestamp
- **REJECTED** → Immutable; contains the director's rejection reason

### Additional Highlights

- 🔐 **JWT Authentication** — Stateless session tokens stored in HTTP-only secure cookies
- 🖊️ **Digital Signatures** — Employees and directors provide signature stamps on voucher submissions
- 📎 **Receipt Uploads** — JPG, PNG, PDF support with 5MB size validation
- 🏷️ **Auto-Generated Voucher Numbers** — Format: `VCH-YYYYMMDD-XXXX` with uniqueness guarantee
- 🛡️ **Middleware Route Protection** — Server-side auth guards on all `/dashboard/*` routes
- 📊 **Interactive Landing Page** — Live compliance simulator demonstrating the approve/reject workflow
- 🧑‍💼 **Employee Provisioning** — Directors can create new employee accounts from their dashboard

---

## 🔑 Test Credentials

Three pre-seeded accounts are available for immediate testing:

| Role | Email | Password |
|------|-------|----------|
| 👤 Employee | `employee@vouchr.com` | `password123` |
| 👔 Director | `director@vouchr.com` | `password123` |
| 📊 Accounts | `accounts@vouchr.com` | `password123` |

> **Tip:** The login page includes **Quick Switch** buttons that auto-fill credentials for each role.

---

## 🗄 Database Schema

The application uses two core models connected by a one-to-many relationship:

### Entity Relationship

```
┌──────────────┐          ┌──────────────────┐
│     User     │          │     Voucher      │
├──────────────┤          ├──────────────────┤
│ id (UUID PK) │◄────┐    │ id (UUID PK)     │
│ name         │     │    │ voucherNumber    │
│ email (UQ)   │     │    │ status (Enum)    │
│ password     │     │    │ department       │
│ role (Enum)  │     │    │ expenseTitle     │
│ signatureUrl │     │    │ expenseCategory  │
│              │     │    │ expenseDate      │
│              │     └────│ employeeId (FK)  │
│              │          │ amount           │
│              │          │ description      │
│              │          │ employeeSignature│
│              │          │ directorSignature│
│              │          │ approvalDate     │
│              │          │ rejectionReason  │
│              │          │ receiptUrl       │
│              │          │ createdAt        │
└──────────────┘          └──────────────────┘
```

### Enums

- **Role:** `EMPLOYEE` | `DIRECTOR` | `ACCOUNTS`
- **Status:** `DRAFT` | `PENDING` | `APPROVED` | `REJECTED`

### Relationships

- A **User** (Employee) can own many **Vouchers** (one-to-many)
- Each **Voucher** belongs to exactly one **User** via `employeeId` foreign key
- The `status` enum enforces the voucher lifecycle at the database level

---

## 📡 API Documentation

The application uses **Next.js Server Actions** for all mutations and server-side data fetching for reads.

### Authentication Actions (`src/app/actions/auth-actions.ts`)

| Action | Parameters | Role | Description |
|--------|-----------|------|-------------|
| `loginAction` | `FormData(email, password)` | Public | Validates credentials, issues JWT cookie, redirects to role dashboard |
| `logoutAction` | — | Authenticated | Clears session cookie, redirects to login |
| `createEmployeeAction` | `{name, email, passwordSecret}` | Director | Provisions a new employee account |
| `saveSignatureAction` | `url: string` | Authenticated | Saves uploaded signature image URL to user profile |
| `deleteSignatureAction` | — | Authenticated | Removes saved signature from user profile |

### Voucher Actions (`src/app/actions/voucher-actions.ts`)

| Action | Parameters | Role | Description |
|--------|-----------|------|-------------|
| `createVoucher` | `VoucherInput` | Employee | Creates a new draft voucher with Zod validation |
| `updateVoucher` | `id, VoucherInput` | Employee | Updates a draft voucher (owner only) |
| `deleteVoucher` | `id` | Employee | Deletes a draft voucher (owner only) |
| `submitVoucher` | `id, signature` | Employee | Transitions DRAFT → PENDING with employee signature |
| `approveVoucher` | `id, signature` | Director | Transitions PENDING → APPROVED with director signature |
| `rejectVoucher` | `id, reason` | Director | Transitions PENDING → REJECTED with compliance reason |

### REST API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | File upload handler (JPG/PNG/PDF, max 5MB) → returns `{ url }` |

---

## 🚀 Local Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or [Neon](https://neon.tech) cloud)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/omn7/Vouchr.git
cd Vouchr

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# 4. Generate Prisma Client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Seed demo users
npx tsx prisma/seed.ts

# 7. Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

See [`.env.example`](.env.example) for all required variables.

---

## 💡 Assumptions Made

1. **Simplified Authentication:** For ease of reviewer testing, the application uses a custom JWT-based authentication system with pre-seeded mock users rather than a full OAuth/NextAuth provider setup. Three test accounts (Employee, Director, Accounts) are seeded automatically.

2. **Local File Uploads:** Receipt and signature images are stored on the local filesystem (`public/uploads/`) instead of a cloud storage service like AWS S3. This simplifies setup for local development and demo purposes. In a production environment, these would be migrated to S3 or similar object storage.

3. **Single-Tier Approval:** The approval workflow uses a single director approval step. In a real enterprise system, multi-level approval chains would be implemented.

4. **No Email Notifications:** Voucher status changes do not trigger email notifications. In production, transactional emails would notify employees of approvals/rejections.

5. **Signature as Text/Image URL:** Digital signatures are represented as text strings or uploaded image URLs rather than cryptographic digital signatures.

---

## 📁 Project Structure

```
Vouchr/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Demo user seeding script
├── public/
│   └── uploads/               # Uploaded receipts & signatures
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── auth-actions.ts     # Login, logout, user management
│   │   │   └── voucher-actions.ts  # CRUD + state transitions
│   │   ├── api/
│   │   │   └── upload/route.ts     # File upload API endpoint
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Shared dashboard layout
│   │   │   ├── employee/           # Employee workspace
│   │   │   ├── director/           # Director workspace
│   │   │   └── accounts/           # Accounts workspace
│   │   ├── login/page.tsx          # Login page with role switcher
│   │   ├── page.tsx                # Landing page with simulator
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── generated/prisma/           # Auto-generated Prisma client
│   ├── lib/
│   │   ├── auth.ts                 # JWT sign/verify + getCurrentUser
│   │   ├── db.ts                   # Prisma client (Neon/local adapter)
│   │   └── hash.ts                 # bcrypt password utilities
│   └── middleware.ts               # Route protection + role guards
├── vercel.json                     # Vercel deployment config
├── package.json
└── tsconfig.json
```

---

## 📄 License

This project was developed as a Full Stack Internship Assignment.

---

<p align="center">
  Built with ❤️ by <strong>Om Narkhede</strong>
</p>
