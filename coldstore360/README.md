# ColdStore360 Operations Suite

ColdStore360 is a production-ready Web Application tailored specifically for cold storage warehousing and logistics. It is designed to handle inward/outward logistics, inventory tracking, financial billing (invoicing), and physical stock reconciliation (discrepancies).

## Tech Stack
- **Frontend Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v3) + Material Design 3 guidelines
- **State Management**: React Query (`@tanstack/react-query`)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Material Symbols Outlined

## Key Features

1. **Dashboard & Real-time Alerts**
   - A live operational summary of warehouse capacity, inward/outward volumes, and recent activity.
   - Powered by Supabase Realtime, the dashboard displays toast notifications immediately when an inventory transaction occurs.

2. **Inward & Outward Logistics**
   - Form-based workflows for logging goods entering and leaving the warehouse.
   - Automatically computes remaining available stock and updates batch statuses.

3. **Inventory Management**
   - View all current stock batches, filter by trader, and check available vs received quantities.
   - Detailed ledger of every single transaction (Inward, Outward, Adjustment) tied to a batch.

4. **Billing & Invoicing**
   - A Finance module that calculates storage duration (days) automatically.
   - Generates invoices ensuring that a batch is only billed once after it is `FULLY_DISPATCHED`.

5. **Discrepancy & Reconciliation**
   - Dedicated module for physical stock counts.
   - Automatically detects shortages/excesses, corrects the system ledger with an `ADJUSTMENT` transaction, and records an Audit Log for accountability.

6. **Authentication & Security**
   - Row Level Security (RLS) is enabled to protect data.
   - Protected routes ensure that only authenticated users can access the dashboard.
   - Auto-provisioning of user profiles via database triggers upon registration.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project (Local or Hosted)

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   Run the SQL scripts in the `supabase/` folder in this order using your Supabase SQL Editor:
   - `migrations/20260810120000_initial_schema.sql` (Schema Creation)
   - `auth_setup.sql` (Security & Triggers)
   - `seed.sql` (Mock Data - Traders, Products, Inventory)
   - `seed_billing.sql` (Mock Data - Billing & Invoices)

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Architecture Notes
- All API calls to Supabase are centralized in `src/lib/api.ts`.
- `AuthContext.tsx` provides global access to the current logged-in user.
- UI Components heavily utilize Material Design 3 (MD3) design tokens (Surface, Primary, Error) via Tailwind configurations.
