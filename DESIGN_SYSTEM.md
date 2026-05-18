# Izifacture — Design System & Antigravity Rules

> This document is the single source of truth for every UI decision in this application.
> Every new page, component, or feature MUST follow these rules without exception.
> When in doubt, copy an existing pattern from the dashboard rather than inventing a new one.

---

## 1. FOUNDATIONS

### 1.1 Color Palette

**Neutrals — always use `slate`, never `gray` or `zinc`**

| Token | Value | Usage |
|---|---|---|
| `slate-900` | `#0F172A` | Primary text, headings, bold numbers |
| `slate-800` | `#1E293B` | Secondary headings |
| `slate-700` | `#334155` | Medium-weight labels |
| `slate-600` | `#475569` | Body text, descriptions |
| `slate-500` | `#64748B` | Subtitles, meta info |
| `slate-400` | `#94A3B8` | Placeholders, muted labels |
| `slate-300` | `#CBD5E1` | Disabled states |
| `slate-200` | `#E2E8F0` | Dividers, light borders |
| `slate-100` | `#F1F5F9` | Hover backgrounds, subtle fills |
| `slate-50`  | `#F8FAFC` | Page background (same as `bg-muted`) |

**Primary — violet purple**

| Token | Value | Usage |
|---|---|---|
| `primary-600` | `#7C3AED` | Primary actions, active states, links |
| `primary-700` | `#6D28D9` | Hover on primary |
| `primary-100` | `#EDE9FE` | Soft backgrounds, active tab pills |
| `primary-50`  | `#F5F3FF` | Icon backgrounds, hover tints |

**Semantic**

| Color | Tailwind | Usage |
|---|---|---|
| Success | `emerald-*` | Paid status, positive trends |
| Warning | `amber-*` | Sent/pending status |
| Danger  | `red-*`    | Overdue status, delete actions |
| Info    | `blue-*`   | Informational stat cards |

**Page background:** `bg-muted` = `#F8FAFC` (never pure `white` for page BG)  
**Card background:** `bg-white` always — never tinted card backgrounds  
**Borders:** `border-slate-100` for cards/sections, `border-slate-200` for inputs

---

### 1.2 Typography

**Font:** Inter (loaded via Google Fonts). Never use system-ui alone.

**Scale — use exactly these, never others:**

| Role | Classes | Example usage |
|---|---|---|
| Page title | `text-xl sm:text-2xl font-bold text-slate-900 tracking-tight` | "Factures", "Dashboard" |
| Section title | `text-sm font-semibold text-slate-900` | Card headers |
| Stat number | `text-2xl font-bold text-slate-900 tracking-tight leading-none` | "1 450 000 FCFA" |
| Body | `text-sm text-slate-600` | Descriptions, paragraphs |
| Label / meta | `text-xs text-slate-500` | Dates, subtitles under values |
| Table header | `text-2xs font-semibold text-slate-400 uppercase tracking-widest` | Column labels |
| Table cell primary | `text-sm font-medium text-slate-900` | Client name |
| Table cell secondary | `text-sm text-slate-500` | Dates, secondary info |
| Invoice number | `font-mono text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md` | INV-202601-001 |
| Section label (sidebar) | `text-2xs font-semibold text-slate-400 uppercase tracking-widest` | "PRINCIPAL", "FINANCES" |
| Alert / caption | `text-xs text-slate-400` | Helper text, hints |

**Key rules:**
- Large financial numbers always get `tracking-tight leading-none`
- Never use `font-extrabold` or `font-black` — max is `font-bold` (700)
- Amounts always formatted with `formatFCFA()` — never raw numbers
- Dates always formatted with `formatDate()` — never raw ISO strings

---

### 1.3 Spacing System

Use **only** these spacing values: `1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 16, 20, 24`

**Canonical patterns:**
- Card internal padding: `p-5` (20px)
- Card header/footer padding: `px-5 py-4`
- Table cell padding: `px-4 py-4` (desktop), `px-3 py-3.5` (compact)
- Table horizontal padding (first/last): `px-5`
- Page content padding: `p-4 lg:p-6`
- Section gap: `gap-4` (cards), `gap-3` (tight)
- Component internal gap: `gap-2` or `gap-2.5`
- Icon-to-text gap: `gap-2` or `gap-1.5`

**Never** use arbitrary values like `px-7`, `mt-3.5`, `pb-11`, etc.

---

### 1.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Inputs, small chips, tags |
| `rounded-xl` | 12px | Buttons, inline elements |
| `rounded-2xl` | 16px | Cards, panels, modals — **the standard card radius** |
| `rounded-3xl` | 24px | Large featured elements only |
| `rounded-full` | 9999px | Badges, avatars, pills |

**Rule:** Every white card in the app uses `rounded-2xl`. Never use `rounded-xl` for a top-level card.

---

### 1.5 Shadows

| Token | Usage |
|---|---|
| `shadow-card` | Default card resting state |
| `shadow-card-md` | Card on hover (`group-hover:shadow-card-md`) |
| `shadow-card-lg` | Modals, dropdowns, elevated panels |
| `shadow-glow-sm` | Focus rings, active inputs |
| `shadow-inner-sm` | Icon containers, inset fields |

**Never** use Tailwind default shadows (`shadow`, `shadow-md`, `shadow-lg`) — always use the custom `shadow-card*` tokens.

---

### 1.6 Borders

- Cards: `border border-slate-100`
- Inputs: `border border-slate-200` → `focus:border-primary-400`
- Section dividers: `border-b border-slate-100`
- Status badges: thin colored border matching background (e.g., `border-emerald-200`)
- **Never** use `border-gray-*` anywhere

---

## 2. COMPONENT PATTERNS

### 2.1 Page Layout

Every dashboard page follows this exact structure:

```tsx
<DashboardShell title="Page Title">
  {/* 1. Page header — always first */}
  <div className="flex items-center justify-between gap-3 mb-6">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        Page Title
      </h2>
      <p className="text-sm text-slate-500 mt-0.5">Subtitle or count</p>
    </div>
    {/* Primary CTA — top right */}
    <Button size="md">
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Full label</span>
      <span className="sm:hidden">Short</span>
    </Button>
  </div>

  {/* 2. Alert banner (if needed) */}
  {/* 3. Stat cards (if needed) */}
  {/* 4. Main content */}
</DashboardShell>
```

---

### 2.2 Cards

**Standard white card:**
```tsx
<div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
  {/* Optional header */}
  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-slate-900">Title</h3>
  </div>
  {/* Body */}
  <div className="p-5">
    {/* content */}
  </div>
</div>
```

**Hover-lift card (stat cards, clickable cards):**
```tsx
<div className="bg-white rounded-2xl border border-slate-100 shadow-card
                hover:shadow-card-md hover:-translate-y-0.5
                transition-all duration-200 cursor-default overflow-hidden">
```

**Never** add padding directly to the card wrapper — always use an inner div.

---

### 2.3 Tables

**Anatomy:**

```tsx
<div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
  {/* Thead */}
  <thead>
    <tr className="border-b border-slate-100">
      <th className="text-left px-5 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">
        Column
      </th>
    </tr>
  </thead>
  {/* Tbody */}
  <tbody>
    <tr className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer">
      <td className="px-5 py-4 text-sm font-medium text-slate-900">value</td>
    </tr>
  </tbody>
</div>
```

**Rules:**
- Row height: `py-4` on cells = ~64px rows
- Hover: `hover:bg-slate-50/60 transition-colors` — never `hover:bg-gray-*`
- Actions: `opacity-0 group-hover:opacity-100 transition-opacity` (reveal on row hover)
- First column padding: `px-5`, all others: `px-4`
- Every table has a **mobile card list fallback** (`sm:hidden`) and a **desktop table** (`hidden sm:block`)

**Mobile table fallback pattern:**
```tsx
{/* Mobile */}
<div className="sm:hidden divide-y divide-slate-50">
  {items.map(item => (
    <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50/60 active:bg-slate-100 transition-colors">
      <ClientAvatar name={item.name} />
      <div className="min-w-0 flex-1">{/* primary + secondary info */}</div>
      <div className="shrink-0 flex flex-col items-end gap-1.5">{/* amount + badge */}</div>
    </div>
  ))}
</div>
{/* Desktop */}
<div className="hidden sm:block overflow-x-auto">
  <table>...</table>
</div>
```

---

### 2.4 Client Avatars

Every place a client name appears, it must be paired with an initial avatar:

```tsx
// Utility — copy from src/lib/design-tokens.ts
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];
function clientAvatar(name: string) {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  return { initials: name.slice(0, 2).toUpperCase(), color: AVATAR_COLORS[idx] };
}

// Table row (desktop)
<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", av.color)}>
  {av.initials}
</div>

// Mobile card list
<div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", av.color)}>
  {av.initials}
</div>
```

---

### 2.5 Status Badges

**Always use `<StatusBadge status={...} />`** — never write custom status styles inline.

The component outputs:
```
bg-emerald-50 text-emerald-700 border border-emerald-200  ← paid
bg-amber-50   text-amber-700   border border-amber-200    ← sent
bg-red-50     text-red-700     border border-red-200      ← overdue
bg-slate-50   text-slate-600   border border-slate-200    ← draft
```

Pattern: `bg-{color}-50 text-{color}-700 border border-{color}-200` — apply same logic to any new status.

---

### 2.6 Buttons

Import `Button` from `@/components/ui/button`. Never write raw `<button>` with custom styling for actions.

| Variant | Usage |
|---|---|
| `primary` | One per page max. Page-level CTA ("Nouvelle facture", "Enregistrer"). Gradient. |
| `secondary` | Status transitions, soft secondary CTA. Violet tint. |
| `outline` | Cancel, PDF download, neutral actions. |
| `ghost` | Nav items, icon-only actions in tight spaces. |
| `danger` | Delete, irreversible actions. Only in confirmation context. |

**Size rules:**
- Page header CTA: `size="md"`
- Actions inside tables/cards: `size="sm"`
- Inline tiny actions: `size="xs"`

**Label shortening on mobile:**
```tsx
<Button>
  <span className="hidden sm:inline">Nouvelle facture</span>
  <span className="sm:hidden">Nouveau</span>
</Button>
```

---

### 2.7 Inputs & Selects

```tsx
// Standard focus state — always:
"border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"

// Search bars always use:
"bg-slate-50 rounded-lg px-3 py-2 border border-slate-200
 hover:border-slate-300 focus-within:border-primary-400
 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all"
```

**Never** use `border-gray-*` on inputs.

---

### 2.8 Modals / Sheets

**Desktop:** centered modal  
**Mobile:** bottom sheet (`items-end sm:items-center`, `rounded-t-2xl sm:rounded-2xl`)

```tsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
  <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-card-lg p-6 w-full sm:max-w-md animate-slide-up">
    {/* content */}
  </div>
</div>
```

Backdrop: always `bg-black/40 backdrop-blur-sm`. Never `bg-black/50` or `bg-gray-900/50`.

---

### 2.9 Alert Banners

```tsx
<div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
  <AlertIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
  <div className="min-w-0">
    <p className="text-sm font-semibold text-red-800">Title</p>
    <p className="text-xs text-red-600 mt-0.5">Body text.</p>
  </div>
  <Link className="text-xs font-semibold text-red-700 hover:text-red-800 shrink-0 mt-0.5">Action →</Link>
</div>
```

Replace `red` with `amber` for warnings, `blue` for info, `emerald` for success.

---

### 2.10 Empty States

Every list or table must have an empty state:

```tsx
<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
    <Icon className="w-6 h-6 text-slate-400" />
  </div>
  <p className="text-sm font-semibold text-slate-700">Aucun élément trouvé</p>
  <p className="text-xs text-slate-400 mt-1">Helper text explaining what to do.</p>
  <Button size="sm" variant="secondary" className="mt-4">
    <Plus className="w-3.5 h-3.5" /> CTA
  </Button>
</div>
```

---

## 3. RESPONSIVE RULES

**Breakpoints:**

| Prefix | Width | Pattern |
|---|---|---|
| (none) | 0px+ | Mobile first — base styles |
| `sm:` | 640px+ | Tablets, small laptops |
| `lg:` | 1024px+ | Desktop |
| `xl:` | 1280px+ | Wide desktop |

**Mobile-first rules:**
1. All tables must have a card list fallback at base (hidden at `sm:`)
2. All page titles: `text-xl sm:text-2xl`
3. All button labels: short on mobile, full on `sm:`
4. All grids: single column → `sm:grid-cols-2` → `lg:grid-cols-4`
5. All modals: bottom sheet on mobile, centered on `sm:`
6. Bottom nav is mobile-only (`lg:hidden`) — sidebar is desktop-only (`hidden lg:flex`)
7. Content area gets `pb-20 lg:pb-6` to clear mobile bottom nav
8. All horizontal padding: `px-4 sm:px-5 lg:px-6`

**The two-track pattern (tables):**
```
Mobile  → card list    (base styles, sm:hidden)
Desktop → data table   (hidden sm:block)
```
This is **mandatory** for every list view. No exceptions.

---

## 4. MOTION & TRANSITIONS

**Durations:**
- Micro interactions (hover, focus): `duration-150`
- Panel/card transitions: `duration-200`
- Sidebar collapse: `duration-250` (custom CSS class `sidebar-transition`)
- Modals, drawers: `duration-300`

**Easing:** always `ease-out` for enter, never `ease-in`.

**Standard hover for cards:**
```
hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200
```

**Standard hover for rows:**
```
hover:bg-slate-50/60 transition-colors
```

**Standard hover for buttons/links:**
```
transition-colors duration-150
```

**Entry animations:**
- New content: `animate-fade-in` (from `globals.css`)
- Modals, drawers: `animate-slide-up`
- Stat numbers: `animate-count`

---

## 5. ICONS

**Library:** `lucide-react` exclusively. Never use heroicons, fontawesome, or SVG files.

**Size rules:**
- Page-level icons in buttons: `w-4 h-4`
- Sidebar nav icons: `w-4 h-4` (expanded) / `w-5 h-5` (collapsed)
- Stat card icons: `w-5 h-5` inside a `w-10 h-10` container
- Table action icons: `w-3.5 h-3.5`
- Alert icons: `w-4 h-4` with `shrink-0 mt-0.5`
- Empty state icons: `w-6 h-6`

**Preferred icons per concept:**
| Concept | Icon |
|---|---|
| Invoices | `Receipt` |
| Clients | `Users2` |
| Settings | `Settings2` |
| Dashboard | `LayoutDashboard` |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| View | `Eye` |
| Download PDF | `Download` |
| Send | `Send` |
| Paid | `CheckCircle` |
| Overdue/Alert | `AlertTriangle` |
| Search | `Search` |
| Back | `ArrowLeft` |
| External link | `ArrowUpRight` |

---

## 6. DATA FORMATTING

**Always use these helpers from `@/lib/formatters.ts`:**

```ts
formatFCFA(amount: number)  // "1 450 000 FCFA"
formatDate(dateStr: string)  // "08/01/2026"
todayISO()                   // "2026-01-08"
```

**Rules:**
- Never display raw numbers — always `formatFCFA()` for FCFA amounts
- Never display ISO dates — always `formatDate()` for user-facing dates
- Invoice numbers always in `font-mono` with the `bg-primary-50` chip style
- Zero amounts display as "0 FCFA", not blank
- Percentages: `8.2%` with sign (↑ / ↓) and semantic color (emerald/red)

---

## 7. SECTION PATTERNS

### 7.1 Stat Card Grid
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
  <StatCard ... />
</div>
```
Always 2 columns on mobile, 4 on desktop.

### 7.2 Two-Column Layout (chart + widget)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
  <div className="lg:col-span-2">{/* main chart */}</div>
  <div className="lg:col-span-1">{/* secondary widget */}</div>
</div>
```

### 7.3 Three-Column Bottom Row
```tsx
<div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
  <div className="xl:col-span-1">{/* summary/sidebar panel */}</div>
  <div className="xl:col-span-2">{/* main table */}</div>
</div>
```

---

## 8. STRICT PROHIBITIONS

> These patterns are banned. If you see them, fix them.

| ❌ Banned | ✅ Correct replacement |
|---|---|
| `bg-gray-*` / `border-gray-*` | `bg-slate-*` / `border-slate-*` |
| `rounded-xl` on top-level cards | `rounded-2xl` |
| `shadow-md`, `shadow-lg` | `shadow-card-md`, `shadow-card-lg` |
| Raw `<button>` with custom styling | `<Button variant="...">` component |
| Inline status color styles | `<StatusBadge status={...} />` component |
| Raw `amount.toLocaleString()` | `formatFCFA(amount)` |
| Raw ISO date strings | `formatDate(dateStr)` |
| Tables without mobile fallback | Always add `sm:hidden` card list |
| `text-gray-*` | `text-slate-*` |
| Arbitrary spacing (`px-7`, `mt-11`) | Canonical spacing values only |
| `font-extrabold` or `font-black` | `font-bold` max |
| Colored page backgrounds | `bg-white` cards on `bg-muted` page |
| `transition` without `duration-*` | Always explicit duration |

---

## 9. FILE CONVENTIONS

```
src/
  components/
    ui/           ← Primitives: Button, Input, Select, Badge, Card, Modal
    layout/       ← Shell: DashboardShell, Sidebar, Header, BottomNav
    dashboard/    ← Dashboard-specific: StatCard, MiniSparkline, RevenueChart
    invoices/     ← Invoice-specific components
    clients/      ← Client-specific components
  lib/
    design-tokens.ts  ← Avatar colors, shared helpers
    formatters.ts     ← formatFCFA, formatDate
    utils.ts          ← cn()
    mock-data.ts      ← All mock data
  types/index.ts      ← All TypeScript types
```

**Rules:**
- Generic UI → `components/ui/`
- Feature-specific → `components/{feature}/`
- Never put business logic in `components/ui/`
- Never duplicate `formatFCFA` or `clientAvatar` — import from `lib/`

---

## 10. CHECKLIST FOR EVERY NEW PAGE

Before considering a page complete, verify:

- [ ] Wrapped in `<DashboardShell title="...">`
- [ ] Page header: `text-xl sm:text-2xl font-bold text-slate-900 tracking-tight`
- [ ] Primary CTA button uses `variant="primary"` with short mobile label
- [ ] All cards use `rounded-2xl border border-slate-100 shadow-card`
- [ ] All amounts use `formatFCFA()`
- [ ] All dates use `formatDate()`
- [ ] Every list has a mobile card fallback (`sm:hidden`) + desktop table (`hidden sm:block`)
- [ ] Every table has an empty state
- [ ] Client names paired with avatar initials using `clientAvatar()` from `design-tokens.ts`
- [ ] Status always uses `<StatusBadge />`
- [ ] Content area clears mobile bottom nav (`pb-20 lg:pb-6` is set in shell)
- [ ] Modals use bottom-sheet pattern on mobile
- [ ] No `gray-*` tokens anywhere
- [ ] No arbitrary spacing values
- [ ] Hover states on all interactive elements
