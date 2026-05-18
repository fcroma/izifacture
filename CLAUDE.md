# Izifacture — Invoicing SaaS for African Entrepreneurs

## ⚠️ MANDATORY: Read DESIGN_SYSTEM.md before touching any UI

Every component, page, or layout change MUST follow `DESIGN_SYSTEM.md`.
It is the antigravity rule — it keeps every page visually consistent with the dashboard.
The checklist at the end of DESIGN_SYSTEM.md must pass before any page is considered done.

## Stack
- **Framework**: Next.js 14 (App Router, `src/` directory)
- **Styling**: Tailwind CSS — custom tokens in `tailwind.config.ts`
- **Language**: TypeScript (strict)
- **Charts**: Recharts (already installed)
- **Icons**: lucide-react exclusively
- **Database**: Supabase — not yet wired, currently using mock data in `src/lib/mock-data.ts`
- **Deployment**: Vercel (planned)

## Dev commands
```bash
npm run dev      # start dev server → http://localhost:3000
npm run build    # production build
npx tsc --noEmit # type-check
npm run lint     # eslint
```

## Project structure
```
src/
  app/
    dashboard/page.tsx         # Main dashboard
    invoices/
      page.tsx                 # Invoice list with inline status changer
      new/page.tsx             # New invoice form
      [id]/page.tsx            # Invoice detail + print
      [id]/edit/page.tsx       # Edit invoice
    clients/page.tsx           # Client management
    settings/page.tsx          # Company settings + invoice model
    help/page.tsx              # Help, FAQ, live chat modal
  components/
    ui/         Button, Input, Select, Badge, Card
    layout/     DashboardShell, Sidebar, Header, BottomNav
    dashboard/  StatCard, MiniSparkline, RevenueChart, PaymentDonut, RecentInvoicesTable
    invoices/   InvoiceForm (with ClientDropdown + AddClientModal), InvoicePreview
  lib/
    design-tokens.ts  ← clientAvatar(), alertVariants, tableClasses, cardClasses, pageClasses — import here, never redefine
    mock-data.ts      ← All hardcoded data (mockClients, mockInvoices, mockCompany)
    formatters.ts     ← formatFCFA(), formatDate(), todayISO()
    utils.ts          ← cn()
  types/index.ts      ← Invoice, Client, Company, InvoiceStatus
```

## Critical conventions (summary — full rules in DESIGN_SYSTEM.md)
- **Neutrals**: always `slate-*`, never `gray-*` or `zinc-*`
- **Card radius**: always `rounded-2xl`, never `rounded-xl` for top-level cards
- **Shadows**: always `shadow-card`, `shadow-card-md`, `shadow-card-lg`
- **Amounts**: always `formatFCFA()` — never raw numbers
- **Dates**: always `formatDate()` — never raw ISO strings
- **Status**: always `<StatusBadge status={...} />` — never inline color logic
- **Client names**: always paired with `clientAvatar()` from `design-tokens.ts`
- **Tables**: always two-track — `sm:hidden` card list + `hidden sm:block` table
- **Modals**: bottom-sheet on mobile, centered on `sm:`
- **Primary button**: one per page, `variant="primary"` with gradient

## Feature inventory (Phase 2 + Phase 3 in progress)

### Invoice list (`/invoices`)
- Status tabs with live counts (Toutes / Brouillons / Envoyées / Payées / En retard)
- Search by client name or invoice number
- **Inline status changer**: click any status badge → dropdown to switch status instantly
- Invoices stored in local React state (ready for Supabase swap)

### Invoice detail (`/invoices/[id]`)
- Status progression button (draft → sent → paid)
- **Print**: opens a clean styled print window (no sidebar/header) and auto-triggers browser print dialog
- PDF button (UI only — wiring planned)
- Delete modal with confirmation

### Invoice form (`/invoices/new`, `/invoices/[id]/edit`)
- **ClientDropdown**: custom dropdown with avatar initials, search filter, chevron arrow
- **AddClientModal**: inline modal to create a new client without leaving the page — auto-selects after creation
- Dynamic line items with live subtotal / TVA 18% / total TTC
- Invoice preview panel (desktop: sticky sidebar, mobile: toggle)

### Settings (`/settings`)
- Company identity (name, email, phone, address, logo upload)
- Billing preferences (currency FCFA fixed, TVA 18% fixed, invoice number prefix)
- **Invoice model**: visual template picker (Classique / Moderne / Minimaliste), default payment delay, default footer note, default email subject with variable tags

### Help (`/help`)
- Quick start guides
- FAQ accordion
- Contact cards (email, phone, live chat)
- **Live chat modal**: in-app conversation thread with message bubbles, typing indicator, simulated support reply. WhatsApp bridge planned for Phase 3 (Meta Cloud API or whatsapp-web.js).

## Current phase
**Phase 2 complete + Phase 3 UI in progress** — all pages built with mock data, premium UI in place, key interactions wired with local state.

## Next steps (in order)
1. **Wire Supabase** — replace mock data with real DB (schema migrations already planned)
2. **react-hook-form + zod** validation on invoice form
3. **Auth** — Supabase Auth + middleware
4. **Live chat backend** — connect to Meta Cloud API (free tier) or whatsapp-web.js to bridge in-app chat ↔ WhatsApp (+18594461718)
5. **PDF export** — generate downloadable PDF from invoice detail
6. **Email sending** — send invoice by email from the detail page
7. **Landing page**
8. **Deploy to Vercel**

## Known decisions & tradeoffs
- **WhatsApp bridge**: chose NOT to use Twilio (paid). Options are Meta Cloud API (free, needs business verification) or whatsapp-web.js (free, unofficial, ban risk). Decision pending.
- **Print**: uses `window.open()` with inline HTML/CSS rather than CSS `@media print` — avoids touching layout components and gives cleaner output.
- **Status changes**: stored in local React state only — will be persisted to Supabase when wired.
- **New clients in invoice form**: added to local state only — not persisted to `mockClients` array.
