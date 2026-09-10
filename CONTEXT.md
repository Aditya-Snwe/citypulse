# CITYPULSE — Agent Context File

> **Read this first.** This file gives any AI agent full context to continue development with minimal ramp-up.

## What Is This

**CityPulse** is a citizen-centric smart city **mobile web app** (college CEP project).

Citizens use it to:
1. Report civic issues (potholes, garbage, waterlogging, broken streetlights, etc.)
2. Attach a photo + GPS location
3. View nearby hazard alerts on a community map
4. Confirm/deny whether a reported issue still exists
5. Track their own submitted reports

**Key principle:** The citizen never picks a government department. They just say "there's a pothole here" — the app categorizes it internally.

**Flow:** Report → Process → Verify → Alert nearby citizens → Community updates

This is NOT an authority/government dashboard. It's the citizen-facing app.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 6.x |
| Bundler | Vite | 8.x |
| Styling | Tailwind CSS | 4.x (via `@tailwindcss/vite` plugin) |
| Routing | React Router | 7.x (`react-router-dom`) |
| Maps | Leaflet + React-Leaflet | 1.9 / 5.0 |
| Icons | Lucide React | 1.44 |
| Linter | oxlint | 1.79 |

**No backend yet.** All data is mock + localStorage.

---

## Project Location

```
d:\CEPL\citypulse\        ← This is the project root (run npm commands here)
d:\CEPL\UI\               ← UI reference designs (read-only, not part of build)
```

---

## How to Run

```bash
cd d:\CEPL\citypulse
npm install
npm run dev              # → http://localhost:5173
npm run dev -- --host    # → also accessible on LAN (for phone testing)
npm run build            # production build → dist/
```

---

## Architecture Overview

```
src/
├── main.tsx                    # React root, mounts <App/>
├── App.tsx                     # BrowserRouter + all routes wrapped in PhoneShell
├── index.css                   # Tailwind v4 imports, theme tokens, leaflet overrides
├── App.css                     # Legacy scaffold CSS (unused, safe to delete)
│
├── types/
│   └── report.ts               # ALL type definitions (Report, Severity, IssueType, etc.)
│
├── data/
│   └── mockReports.ts          # 8 mock Nashik civic reports + NASHIK_CENTER + NEARBY_ALERT_IDS
│
├── lib/
│   ├── cn.ts                   # className joiner (like clsx but tiny)
│   ├── format.ts               # formatRelative, formatDate, formatCoords, greeting, formatDistance
│   └── issueMeta.ts            # ISSUE_TYPES array, categoryForType(), severityForType(), matchesMapFilter(), issueEmoji()
│
├── context/
│   └── ReportsContext.tsx       # React context + provider for all report state
│                                  - reports: merged mock + user-created
│                                  - addReport(): creates new report, saves to localStorage
│                                  - confirmIssue(): community yes/no voting
│                                  - getReport(), getVote()
│                                  - Storage keys: "citypulse.userReports", "citypulse.votes"
│
├── components/
│   ├── PhoneShell.tsx           # Layout wrapper: max-w-[430px] centered, renders <Outlet/> + BottomTabBar
│   ├── BottomTabBar.tsx         # 5-tab fixed nav (Home, Community, Report↑, My Reports, Profile) + BellButton
│   ├── TopHeader.tsx            # Sticky header with title, optional back button, optional bell icon
│   ├── AlertCard.tsx            # Nearby alert card (severity edge color, distance, time)
│   ├── ReportCard.tsx           # Report list card (ID, type, location, date, status badge)
│   ├── StatusBadge.tsx          # StatusBadge (report status) + SeverityBadge (High/Med/Low)
│   ├── IssueTypeCard.tsx        # Selectable issue type card with icon (used in report step 1)
│   ├── MapView.tsx              # Reusable Leaflet map: shows report markers, supports click-to-pick
│   ├── Timeline.tsx             # Vertical step timeline (done/active/pending states)
│   └── VerificationCard.tsx     # "Is this issue still present?" yes/no voting card
│
└── pages/
    ├── Landing.tsx              # "/" — Welcome screen, CITYPULSE branding, Continue as Citizen / Sign In
    ├── Home.tsx                 # "/home" — Dashboard: greeting, report CTA, nearby alerts, your reports
    ├── ReportIssue.tsx          # "/report" — 4-step wizard: Issue type → Map location → Photo+desc → Review → Submit
    ├── ReportDetails.tsx        # "/reports/:id" — Full report view with timeline, verification, nearby alert
    ├── MyReports.tsx            # "/reports" — All/Active/Resolved tabs, metrics cards, report list
    ├── CommunityMap.tsx         # "/map" — Full-screen Leaflet, filter chips, legend, bottom sheet on marker tap
    ├── Profile.tsx              # "/profile" — Demo user info, nav links, sign out
    └── Notifications.tsx        # "/notifications" — Mock nearby alert list
```

---

## Routes

| Path | Page | Has Tab Bar | Notes |
|------|------|:-----------:|-------|
| `/` | Landing | ❌ | Entry point, no auth yet |
| `/home` | Home | ✅ | Main dashboard |
| `/map` | CommunityMap | ✅ | Full-screen map |
| `/report` | ReportIssue | ✅ | 4-step wizard |
| `/reports` | MyReports | ✅ | Filtered report list |
| `/reports/:id` | ReportDetails | ✅ | Single report detail |
| `/profile` | Profile | ✅ | Demo user |
| `/notifications` | Notifications | ✅ | Mock alerts |

---

## Design System

**Theme:** Light civic interface with Material 3–inspired color tokens.

Key colors defined in `index.css` `@theme` block:
- **Primary:** `#004ac6` (text/borders), `#2563eb` (container/buttons)
- **Tertiary/Success:** `#006242` / `#007d55`
- **Error:** `#ba1a1a`
- **Severity:** High `#ef4444`, Medium `#f59e0b`, Low `#10b981`
- **Surfaces:** Layered from `#ffffff` (lowest) → `#d3e4fe` (highest)

**Typography:** Inter (loaded via Google Fonts in `index.html`)

**Mobile-first constraints:**
- All pages render inside `max-w-[430px]` phone shell
- Single-column layouts only
- Min tap targets: 44px (`min-h-11` / `min-h-12`)
- Bottom tab bar is the only navigation (no desktop navbar)

---

## Data Model

```typescript
interface Report {
  id: string              // "CP-1042"
  type: IssueType         // "Pothole" | "Road Damage" | "Garbage" | ...
  category: IssueCategory // "Road Infrastructure" | "Waste" | "Water" | "Electricity" | "Other"
  description: string
  locationLabel: string   // "College Road, Nashik"
  latitude: number
  longitude: number
  severity: Severity      // "High" | "Medium" | "Low"
  status: ReportStatus    // "Submitted" | "In Progress" | "Community Confirmed" | "Community Monitoring" | "Resolved"
  reportedAt: string      // ISO date
  confirmations: number   // community vote count
  image: string | null    // data URL or Unsplash URL
  isMine?: boolean        // true for user-created + some mock reports
  distanceMeters?: number
  timeline?: TimelineStep[]
}
```

**Issue types (8):** Pothole, Road Damage, Garbage, Water Leakage, Waterlogging, Broken Streetlight, Fallen Tree, Other

**Auto-mapping:** `issueMeta.ts` maps each issue type → category and default severity. The citizen never chooses a department.

---

## State Management

- **ReportsContext** (React Context + `useState` + `localStorage`)
- Mock reports from `mockReports.ts` are always included
- User-created reports are prepended and persisted to `localStorage("citypulse.userReports")`
- Community votes persisted to `localStorage("citypulse.votes")`
- Report IDs auto-increment from highest existing: `CP-1043`, `CP-1044`, ...

---

## What's Done (Phase 1) ✅

- [x] Project scaffold (Vite + React + TS + Tailwind + Router + Leaflet)
- [x] Phone-first shell with bottom tab bar
- [x] Landing page with branding
- [x] Home dashboard with alerts + reports
- [x] 4-step report wizard (issue → map → photo → review → submit)
- [x] Report details with timeline + community verification
- [x] My Reports with filtering tabs
- [x] Community map with markers, filters, legend, bottom sheet
- [x] Profile + Notifications pages
- [x] Mock data (8 Nashik reports)
- [x] localStorage persistence
- [x] TypeScript compiles clean, production build succeeds

---

## What's NOT Done Yet (Future Phases)

**Do NOT start these without explicit user request:**

| Feature | Priority | Notes |
|---------|----------|-------|
| AI categorization | High | Auto-categorize from photo/description (LLM/vision API) |
| Real authentication | High | Firebase Auth or similar, replace mock login |
| Backend API | High | Database persistence (Supabase/Firebase/Express+Mongo) |
| Push notifications | Medium | Real alert delivery for nearby citizens |
| Reverse geocoding | Medium | Convert lat/lng → readable address on report |
| Authority dashboard | Medium | Separate interface for municipal staff |
| Real-time updates | Medium | WebSocket/polling for live report feeds |
| Dark mode | Low | Color tokens already support it, just add variant |
| PWA support | Low | Service worker, manifest, offline |
| IoT/sensors integration | Future | Not in scope for college project |
| Blockchain | Never | Explicitly out of scope |

---

## Conventions & Patterns

1. **Components** are functional, use arrow destructuring for props
2. **Styling** is Tailwind utility classes exclusively (no CSS modules)
3. **File naming:** PascalCase for components/pages, camelCase for lib/data
4. **Imports:** Use `type` imports where possible (`import type { Report }`)
5. **Navigation:** `useNavigate()` for programmatic, `<Link>` / `<NavLink>` for declarative
6. **cn()** utility for conditional class joining (like clsx)
7. **No separate desktop layout** — desktop just shows the phone-width app centered

---

## Common Tasks for Next Agent

### Adding a new page
1. Create `src/pages/NewPage.tsx`
2. Add route in `App.tsx` inside the `<Route element={<PhoneShell />}>` block
3. If it should show in tab bar, add its path to `TAB_ROUTES` in `PhoneShell.tsx`

### Adding a new issue type
1. Add to `IssueType` union in `types/report.ts`
2. Add to `ISSUE_TYPES` array in `lib/issueMeta.ts`
3. Add category mapping in `categoryForType()`
4. Add severity mapping in `severityForType()`
5. Add emoji in `issueEmoji()`
6. Add icon in `IssueTypeCard.tsx` `ICONS` record

### Adding a new report status
1. Add to `ReportStatus` union in `types/report.ts`
2. Add color mapping in `StatusBadge.tsx` `styles` record

### Connecting a real backend
1. Replace `localStorage` calls in `ReportsContext.tsx` with API calls
2. Keep the same `Report` interface — backend should match it
3. `addReport()` → POST, `reports` → GET, `confirmIssue()` → PATCH

---

## Mock Data Reference

8 reports centered around **Nashik, Maharashtra, India**:
- Center: `19.9975°N, 73.7898°E`
- Default pin: `20.0063°N, 73.7621°E` (College Road)
- Reports span: College Road, Gangapur Road, Canada Corner, Thatte Nagar, Mahatma Nagar, KTHM College Road
- Images: Unsplash URLs (require internet)

---

*Last updated: 10 Sept 2026 — Phase 1 complete*
