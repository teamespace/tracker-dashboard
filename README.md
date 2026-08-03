# Studio — Freelancer Dashboard (React)

React/Vite rebuild of the single-file `index.html` version, using **@tremor/react**
(Tremor Blocks' underlying npm package — Card, AreaChart, BarChart, DonutChart, Table,
Tabs, Badge, Select, etc.) and **motion** (Framer Motion) for micro-interactions.

## Run it

```
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks + production bundle to dist/
```

## What's inside

- 6 pages: Overview, Projects (board/table + drawer), Earnings, Clients, Invoices, Settings —
  same dummy data model and behavior as the original single-file build.
- Charts/cards/tables/tabs/selects are `@tremor/react` components (the same package the code
  samples on blocks.tremor.so import from), styled with Tailwind + the `emerald` accent.
- Project/client detail panels use `@headlessui/react` `Dialog` (already a Tremor dependency)
  for accessible focus-trapped slide-overs.
- Micro-interactions (`src/components/motion/interactions.tsx`) are hand-built with `motion`,
  the same animation library Amicro is built on.

## Note on Amicro

`amicro.vercel.app` advertises a CLI (`npx @subhanhq/amicro@latest add <component>`) to drop
their micro-interaction components straight into a project. As published on npm today
(`@subhanhq/amicro@1.0.1`), the package ships **only its own built site** (`dist/index.html`
+ assets, no CLI script, no `bin` entry) — confirmed by downloading and unpacking the tarball
— so the command fails with `npm error could not determine executable to run`.

Since the CLI itself is non-functional, the actual component source was pulled directly from
the site instead: each card's "copy" button writes real JSX to the clipboard via
`navigator.clipboard.writeText`, so a small script hooked that call in the live page and
captured the exact code for three components used here:

- **Settings** (Rotate Interaction) → the rotate-on-hover effect on the sidebar nav icons
  (`src/components/Sidebar.tsx`)
- **Search** (Morph Interaction) → the search/clear icon swap in the topbar search field
- **Subscribe** (Ring Interaction, Bell/BellRing) → the notification bell

All three live in `src/components/motion/interactions.tsx`. The only changes from what Amicro's
clipboard gave us: the import path (`framer-motion` → `motion/react`, since `motion` — the
same library, newer package name — was already installed) and the container classNames (their
dark showcase chrome swapped for this dashboard's light theme). The animation values/logic are
unedited.
