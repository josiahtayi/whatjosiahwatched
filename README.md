# What Josiah Watched

A full-stack horror film curation and tracking app built with Next.js 15, MongoDB, and the TMDB API. I feature a new horror film every Friday and use this project to document what I've watched, discover new films, and sharpen my full-stack skills.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Database | MongoDB Atlas |
| Styling | Tailwind CSS v4 |
| External API | TMDB v3 (via `tmdb-ts`) |
| Deployment | Vercel |

---

## Features

**Homepage**
- Cinematic hero banner for the weekly featured film
- "Now in Cinemas" section — live horror discovery via TMDB's trending horror endpoint, with inline quick-add to collection

**Film Detail Page**
- Full metadata: cast, director, genres, runtime, overview
- "More Like This" — TMDB-powered recommendations with inline collection add
- Comment section for notes and reactions

**Admin Dashboard** (`/admin`)
- Password-protected private interface
- Add films by title with auto TMDB metadata lookup
- Set the featured film, edit metadata, delete entries

**Bulk Import** (`scripts/batchImport.ts`)
- Parses CSV movie lists
- Auto-fetches TMDB metadata (title, cast, director, genres, poster)
- Inserts via `insertMany()` with duplicate detection by TMDB ID

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Homepage
│   ├── movies/[id]/page.tsx              # Film detail page
│   ├── admin/page.tsx                    # Admin dashboard
│   ├── manual/page.tsx                   # Manual entry form
│   ├── apple-icon.tsx                    # Apple touch icon (auto-generated)
│   └── api/
│       ├── movies/route.ts               # GET all, POST new film
│       ├── movies/[id]/route.ts          # GET, PATCH, DELETE by ID
│       ├── movies/add/route.ts           # Add via TMDB lookup
│       ├── movies/feature/route.ts       # Set featured film
│       ├── tmdb/search/route.ts          # TMDB title search
│       ├── tmdb/recommendations/[tmdbId] # TMDB recommendations
│       ├── tmdb/horror-now/route.ts      # TMDB now-playing horror
│       └── admin/auth/route.ts           # Admin authentication
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MovieCard.tsx
│   ├── QuickAddCard.tsx                  # Inline add from discovery
│   └── CommentSection.tsx
├── lib/
│   └── mongodb.ts                        # Cached MongoDB connection
scripts/
└── batchImport.ts                        # CSV bulk import
```

---

## MongoDB Schema

**Database:** `whatjosiahwatched` | **Collection:** `Movies`

```ts
{
  tmdbId: number,
  foundTitle: string,
  overview: string,
  genres: string[],
  director: string,
  cast: string,
  posterPath: string | null,
  backdropPath: string | null,
  releaseDate: string,
  runtime: number,
  myRating: number,
  watchedDate: string,
  featuredDate: string | null,
  featured: boolean,
  comments: { text: string, createdAt: Date }[]
}
```

---

## Environment Variables

```
MONGODB_URI=
TMDB_API_KEY=
ADMIN_PASSWORD=
```

---

## Name Origin

> "What Josiah Watched" is a nod to the 2021 psychological horror film *We Need to Do Something* — and a personal twist on my Friday night tradition.

---