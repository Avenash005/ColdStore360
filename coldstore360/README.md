# ColdStore360

ColdStore360 is a web application for operating a cold-storage warehouse. It brings stock receiving, location-aware inventory, dispatches, billing, reconciliation, and reporting into one role-protected workspace.

## Contents

- [Capabilities](#capabilities)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Database setup](#database-setup)
- [Scripts](#scripts)
- [Security and data integrity](#security-and-data-integrity)
- [Contributing](#contributing)

## Capabilities

### Warehouse operations

- Receive stock against a trader and product, then place it in a specific room and slot.
- Dispatch stock, transfer it between locations, and retain a transaction history for every batch.
- Track capacity at both room and slot level, including available, occupied, full, maintenance, and inactive states.
- Inspect inventory by batch, trader, product, room, or slot.

### Business management

- Manage traders, products, storage rooms, and slots.
- Create invoices and calculate storage duration for dispatched batches.
- Reconcile physical counts with system inventory and create accountable adjustment records.
- View operational dashboards, reports, recent activity, and real-time inventory alerts.

### Access control

- Email/password authentication through Supabase Auth.
- Protected application routes.
- Role-based database access policies for administrators, managers, gate staff, and warehouse staff.

## Technology

| Area | Tools |
| --- | --- |
| Client | React 19, TypeScript, Vite |
| Routing | React Router |
| Data fetching | TanStack Query |
| Forms and validation | React Hook Form, Zod |
| UI and charts | Tailwind CSS, Lucide React, Recharts |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Row Level Security) |

## Project structure

```text
.
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared UI, layout, authentication, and inventory components
│   ├── contexts/           # Auth context
│   ├── lib/                # Supabase client and API helpers
│   └── pages/              # Feature pages and routed views
├── supabase/
│   ├── migrations/         # Versioned PostgreSQL schema and policy changes
│   ├── seed.sql            # Optional demo warehouse data
│   └── README.md           # Database setup and operational guidance
└── package.json
```

## Getting started

### Prerequisites

- Node.js 18 or later
- A Supabase project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env` files or Supabase service-role keys. The `.gitignore` already excludes `.env`.

### 3. Apply the database schema

For a new project, apply the migrations through `20260811120000_staff_product_creation_policy.sql` in timestamp order. The `20260812100000_direct_room_slots.sql` migration is only for existing rack-based databases. The Supabase CLI is recommended for repeatable deployments:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

For SQL Editor instructions, optional seed data, and guidance for migrating legacy rack-based databases, see [supabase/README.md](supabase/README.md) and [DIRECT_ROOM_SLOT_MIGRATION.md](supabase/DIRECT_ROOM_SLOT_MIGRATION.md).

### 4. Start the application

```bash
npm run dev
```

Open the local URL shown by Vite (normally `http://localhost:5173`). Create an account at `/signup`, then assign an appropriate role in the `profiles` table if required by your deployment.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build the production bundle. |
| `npm run lint` | Run Oxlint. |
| `npm run preview` | Serve a locally built production bundle. |

## Security and data integrity

ColdStore360 relies on Supabase Row Level Security for database-level access control. Inventory movements use database functions to validate active locations and capacity, update occupancy, create inventory transactions, and write audit events together. Avoid changing quantity or capacity columns directly during normal operations; use the receiving, dispatch, transfer, and reconciliation workflows instead.

## Contributing

1. Create a branch from `main`.
2. Make focused changes and keep database changes in a new timestamped migration.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Describe any required environment, schema, or deployment changes in the pull request.

## License

No license has been specified for this repository.
