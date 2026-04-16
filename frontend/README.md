# AI Watch — Frontend

React 19 dashboard for the AI Watch strategic intelligence platform.

## Stack

- React 19 · React Router v6
- Recharts (data visualisation)
- jsPDF (PDF export)
- Lucide React (icons)
- Tailwind CSS

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/explore` | Explore | News feed — filter by industry/signal, search, grid/list toggle, floating refresh FAB |
| `/article/:id` | Article Detail | Full article — AI summary, key actors, funding, DXC solution match |
| `/trends` | AI Trends | Perplexity live trend intelligence — Deep Dive modal with sources, watchlist, solution match per card |
| `/data` | Data Preview | Charts, stats, funding rounds, news sources table |
| `/reports` | Reports | Saved intelligence reports with PDF / Markdown download |
| `/solutions` | Solutions | DXC solution catalog with fit scoring |
| `/newsletter` | Newsletter | Weekly digest — subscriber management, manual send, SMTP delivery status |

## Features (V4)

- **Trends Onboarding** — First-time users select their role (CTO, Innovation Manager, Strategy Director, Other) and topics of interest; preferences stored in localStorage with backend sync
- **Deep Dive with Sources** — Modal displays structured content (What It Is, Enterprise Impact, Action Plan) with Perplexity-style numbered source chips and expandable source cards
- **Role-aware Analysis** — Deep dive content tailored to user's selected role
- **Emoji Icons** — UI uses native emojis for role/topic cards instead of Material UI icons

## Mobile & Responsive Design

All pages are fully responsive with mobile-first design:

- **Breakpoints**: 375px (iPhone SE), 390px (iPhone 14), 768px (tablet), 1024px+ (desktop)
- **Touch targets**: Minimum 44x44px for all interactive elements
- **Safe areas**: Padding for notched phones (env(safe-area-inset-*))
- **Dark mode**: Full support via CSS variables (html.dark class)

### CategoryCombobox Component

Shared dropdown component (`src/components/CategoryCombobox.jsx`) used across pages:

```jsx
<CategoryCombobox
  selected={category}
  onSelect={setCategory}
  categories={[
    { id: "all", label: "All Categories" },
    { id: "ai", label: "AI (125)" },
  ]}
  isMobile={isMobile}
  fullWidth={isMobile}
/>
```

Props:
- `categories` — Array of `{ id, label }` objects or strings
- `selected` — Currently selected category ID
- `onSelect` — Callback when selection changes
- `isMobile` — Enables larger touch targets (44px height)
- `fullWidth` — Expands to 100% width on mobile
- `dropdownAlign` — "left" (default) or "right"

### CSS Variables (Dark Mode)

All colors use CSS variables defined in `index.css`:

```css
:root {
  --page-bg: #f7f8fa;
  --card-bg: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a68;
  --text-muted: #8e8ea0;
  --border-color: #e2e0ea;
  --blue: #185EA5;
  --blue-light: #e8eef8;
  /* ... */
}

html.dark {
  --page-bg: #0f0f23;
  --card-bg: #1a1a2e;
  --text-primary: #e8e8ed;
  /* ... */
}
```

## Development

```bash
npm install
npm start        # http://localhost:3000
npm run build    # production build → build/
```

The app expects the backend API at `http://localhost:8000`.
Override with: `REACT_APP_API_BASE_URL=https://your-api.example.com`

## Services

All backend calls go through `src/services/api.js` — a thin wrapper with:
- Automatic retry (2 retries, 700 ms delay)
- Per-request timeout (default 25 s)
- Consistent error handling

## Key Files

```
src/
├── pages/
│   ├── Explore.jsx          # News feed with filters, search, grid/list
│   ├── Trends.jsx           # AI trends with Deep Dive modal
│   ├── DataPreview.jsx      # Charts, stats, funding tables
│   ├── Newsletter.jsx       # Weekly digest management
│   ├── ProfilePage.jsx      # User profile & preferences
│   ├── SavedPage.jsx        # Bookmarked articles/trends
│   └── ...
├── components/
│   ├── CategoryCombobox.jsx # Reusable dropdown for category filters
│   ├── TrendsOnboarding.jsx # Role/topic selection wizard
│   └── ...
├── context/
│   ├── AuthContext.jsx      # Authentication state
│   └── SavedItemsContext.jsx # Saved articles/trends watchlist
├── services/
│   └── api.js               # All API calls with retry + auth headers
├── hooks/
│   └── useSaved.js          # Hook for save/unsave functionality
└── utils/
    ├── generatePDF.js       # Shared jsPDF report builder
    └── cleanText.js         # Text sanitization utilities
```
