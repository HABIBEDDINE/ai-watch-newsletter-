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
| `/trends` | AI Trends | Perplexity live trend intelligence — Deep Dive modal, watchlist, solution match per card |
| `/data` | Data Preview | Charts, stats, funding rounds, news sources table |
| `/reports` | Reports | Saved intelligence reports with PDF / Markdown download |
| `/solutions` | Solutions | DXC solution catalog with fit scoring |
| `/matching` | Matching | AI readiness quiz → top 3 recommended DXC solutions (state persisted to localStorage) |
| `/newsletter` | Newsletter | Weekly digest — subscriber management, manual send, SMTP delivery status |

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
├── pages/          # One file per route
├── components/     # Shared UI components
├── services/
│   └── api.js      # All API calls
└── utils/
    └── generatePDF.js   # Shared jsPDF report builder
```
