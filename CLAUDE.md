# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev       # Start dev server at localhost:3000

# Build & production
npm run build
npm run start

# Lint
npm run lint      # ESLint (no --fix flag in current config)
```

No test suite is configured.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

**Tech stack**: Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + TypeScript

**Pattern**: Each route has a thin `page.tsx` (Server Component, just renders the Client Component) and a corresponding `ComponentName.tsx` (Client Component with `"use client"`, holds all logic/UI).

**Supabase clients** (`utils/`):
- `supabase.ts` — client-side singleton (used in all "use client" components)
- `supabase-server.ts` — server-side (SSR/cookie-based)
- `supabaseClient.ts` — duplicate of `supabase.ts`, avoid using

**Auth**: Supabase Auth email/password. Dashboard routes check auth client-side in `useEffect` and redirect to `/login` if no session. No middleware-based protection currently.

**Conflict checking**: Done via Supabase RPC `check_reservation_conflict(p_staff, p_date, p_time, p_course, p_exclude_id)`. Called both at reservation creation (`ReserveForm.tsx`) and at approval (`ReservationList.tsx`).

## Routes & Key Files

| Route | Files | Access |
|-------|-------|--------|
| `/` | `page.tsx`, `Home.tsx` | Public |
| `/reserve` | `reserve/page.tsx`, `reserve/ReserveTop.tsx` | Public |
| `/reserve/form` | `reserve/form/page.tsx`, `reserve/form/ReserveForm.tsx` | Public |
| `/reserve/complete` | `reserve/complete/page.tsx`, `reserve/complete/ReserveComplete.tsx` | Public |
| `/login` | `login/page.tsx` | Public |
| `/dashboard/reservations` | `dashboard/reservations/page.tsx`, `dashboard/reservations/ReservationList.tsx` | Auth required |
| `/dashboard/schedule` | `dashboard/schedule/page.tsx` | Auth required |

## Database Tables

- `reservations`: id, staff (string), date, time, name, tel, email, course (int, minutes), note, status (`pending`|`approved`|`canceled`)
- `staff_schedules`: id, staff, day_of_week, is_working, start_time, end_time
- `staff_exceptions`: id, staff, date, is_working, start_time, end_time, note

**Reservation status flow**: `pending` (created by customer) → `approved` or `canceled` (set by staff in dashboard)

## Styling

Tailwind CSS v4 with custom brand colors defined in `globals.css` via `@theme`:
- `navy` (#1a2332), `beige` (#e8dcc4), `bronze` (#c17a3a), `charcoal` (#2d3748)

Fonts: `Bebas Neue` (headings via `font-heading`), `Noto Sans JP` (body via `font-body`)

## Known Issues / Gaps

Before implementing new features, consult `docs/` (especially `05_current_status.md`):

- **`utils/supabaseClient.ts`** duplicates `utils/supabase.ts` — prefer `utils/supabase.ts`
- **Schedule data not used**: `/dashboard/schedule` stores staff schedules, but `/reserve` still shows fixed slots 10:00–23:00 regardless
- **Role-based access not implemented**: All logged-in users see full customer contact info; staff/admin distinction from domain model is not enforced
- **Staff list is hardcoded**: `["Koshi", "Ryuki", "Asuka"]` in `ReserveTop.tsx`
