# MLBB Stats

<div align="center">

**Explore heroes, rankings, matchups, builds, and the current Mobile Legends: Bang Bang meta.**

[Live App](https://mlbbstats-snowy.vercel.app/) · [Source Code](https://github.com/imainzed5/mlbb-web) · [Rone Arena API](https://github.com/ridwaanhall/rone-arena-api)

<br />

*An unofficial community project for exploring MLBB data.*

</div>

> **Powered by [Rone Arena API](https://github.com/ridwaanhall/rone-arena-api)**<br />
> Game data © MOONTON / Mobile Legends: Bang Bang<br />
> API maintained by **ridwaanhall / RoneAI**<br />
> MLBB Stats is not affiliated with, endorsed by, sponsored by, or associated with MOONTON Games.

## Overview

MLBB Stats is a web application for exploring Mobile Legends hero data and player-facing statistics through a cleaner, more accessible interface.

The project is built on top of the **Rone Arena API**, which provides the underlying MLBB data used throughout the application. MLBB Stats is an independent frontend and data-consumption layer around that API, adding hero discovery, meta analysis, rankings, matchups, trends, authentication, and player-focused views.

## Features

### Hero Browser

Browse the Mobile Legends hero roster with:

- Search, role filtering, and sorting
- Hero detail pages
- Recommended builds
- Matchup information
- Performance trends

### Meta Explorer

Explore the current MLBB meta with filters for:

- Rank
- Lane
- Role
- Time window

Meta filters are reflected in the URL, making specific views easier to share.

### Hero Rankings & Analytics

- View hero performance grouped by tier
- Compare hero positions across the current ranked environment
- Inspect rank-specific performance and trend data
- Review matchup and build information on hero detail pages

Optional analytics modules fail gracefully when upstream data is temporarily unavailable.

### Player Dashboard

Players can connect an MLBB account to access a private dashboard. Authentication uses the Rone Arena account-verification flow, while session information is stored using signed HTTP-only cookies.

### Resilient API Loading

The application normalizes hero data from multiple upstream endpoints and includes fallback handling for upstream failures. Selected public views can use a read-only snapshot when the API is unavailable.

### SEO & Sharing

MLBB Stats includes:

- Typed metadata
- Route-specific Open Graph images
- JSON-LD
- Sitemap generation
- Robots configuration

## Tech Stack

- **Next.js 16** App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Recharts**
- **Rone Arena API**

## Architecture

MLBB Stats acts primarily as a frontend and data-consumption layer on top of the Rone Arena API.

The application handles:

- API communication and response normalization
- Fallback behavior for upstream failures
- UI presentation, filtering, and sorting
- Authentication session handling
- Metadata and SEO generation
- Analytics visualization

The underlying Mobile Legends data API is maintained separately by the Rone Arena project.

## Data Source & Attribution

This project does **not** operate or maintain its own Mobile Legends data API.

### Rone Arena API

The Rone Arena API is an unofficial, community-maintained Mobile Legends data API created and maintained by:

- **ridwaanhall**
- **RoneAI**

Documentation: [arena.rone.dev/api/docs](https://arena.rone.dev/api/docs)<br />
Repository: [github.com/ridwaanhall/rone-arena-api](https://github.com/ridwaanhall/rone-arena-api)

MLBB Stats is an independent frontend application built on top of that API.

### Required attribution

When referring to or redistributing this project, keep the following attribution visible:

> Powered by **Rone Arena API**<br />
> Game data © MOONTON / Mobile Legends: Bang Bang<br />
> API maintained by **ridwaanhall / RoneAI**<br />
> MLBB Stats is an unofficial project and is not affiliated with or endorsed by MOONTON Games.

## Disclaimer

Mobile Legends: Bang Bang, MLBB, associated names, characters, logos, artwork, and game assets are trademarks and intellectual property of their respective owners.

This project is provided for educational, analytical, and community purposes. No affiliation, sponsorship, endorsement, or official relationship with MOONTON Games is implied.

## Routes

### Public

- `/`
- `/heroes`
- `/heroes/[slug]`
- `/heroes/rank`
- `/meta`

### Player

- `/player`
- `/player/[playerKey]`

### Platform

- `/sitemap.xml`
- `/robots.txt`
- Open Graph image routes

### Planned

- `/tools`

## Local Development

Clone the repository:

```bash
git clone https://github.com/imainzed5/mlbb-web.git
cd mlbb-web
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the required environment variables:

```env
MLBB_API_BASE_URL=
NEXT_PUBLIC_SITE_URL=
MLBB_PLAYER_SESSION_SECRET=
```

Optional fallback API hosts:

```env
MLBB_API_FALLBACK_BASE_URLS=
```

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MLBB_API_BASE_URL` | Yes | Primary Rone Arena API host |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL for metadata, sitemap, and SEO |
| `MLBB_PLAYER_SESSION_SECRET` | Yes | Secret used to sign player session cookies |
| `MLBB_API_FALLBACK_BASE_URLS` | No | Additional upstream API hosts used as fallbacks |

Never commit production secrets or `.env.local` files to the repository.

## API

MLBB Stats currently uses the **Rone Arena API** as its upstream data provider.

- Documentation: [arena.rone.dev/api/docs](https://arena.rone.dev/api/docs)
- Project repository: [github.com/ridwaanhall/rone-arena-api](https://github.com/ridwaanhall/rone-arena-api)

If you are building directly with the API, refer to the Rone Arena documentation rather than this repository.

## Status

MLBB Stats is currently under active development.

Core functionality includes:

- Hero browsing
- Hero analytics
- Meta exploration
- Rankings
- Player account connection
- Private player dashboards
- SEO and social sharing metadata
- API fallback handling

Additional tools and analytics may be added over time.

## Contributing

Issues, suggestions, and feedback are welcome.

If you encounter incorrect data from the upstream API, check the [Rone Arena API project](https://github.com/ridwaanhall/rone-arena-api) first before opening an issue here. For bugs specific to the MLBB Stats interface, feel free to open an issue in this repository.

## License & Intellectual Property

The repository does not currently include a separate `LICENSE` file for the MLBB Stats frontend. Unless a license is added, the application source code remains reserved to its copyright holder and should not be assumed to be available for reuse, modification, or redistribution.

The **BSD 3-Clause License** applies to the Rone Arena API project according to its repository. It does not automatically apply to this frontend, Mobile Legends game data, or MOONTON intellectual property.

Mobile Legends: Bang Bang and related names, logos, artwork, characters, and game assets remain the property of their respective owners. See the [Rone Arena API repository](https://github.com/ridwaanhall/rone-arena-api) for its license and attribution requirements.
