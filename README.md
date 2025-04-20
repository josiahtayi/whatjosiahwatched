# What Josiah Watched 👁️

Welcome to **What Josiah Watched**, a horror movie blog and web app I built to showcase my programming skills and passion for horror films. This site features a handpicked horror movie every week (usually watched on **Fridays**) and allows readers to explore past films, leave their thoughts, and engage with the horror-loving community.

---

## 🎯 Project Goal

I created a **full-stack horror movie blog app** where:

- I feature a new horror film every Friday
- Movies are fetched from TMDB and stored in MongoDB
- My private admin interface allows movie management
- Visitors can browse and (soon) comment on each movie
- Fully responsive and mobile-friendly

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** MongoDB
- **Styling:** Tailwind CSS
- **API:** The Movie Database (TMDB)
- **IDE:** WebStorm

---

## 📁 Folder Structure

```
/whatjosiahwatched
├── /app
│   ├── /page.tsx             # Homepage
│   ├── /admin-only/page.tsx  # Admin dashboard
│   └── /api/movies/route.js  # API routes for movies
├── /components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── MovieCard.tsx
├── /lib
│   └── mongodb.ts            # MongoDB connection logic
├── /scripts
│   └── batchImport.ts        # Bulk import from CSV
├── .env.local                # Environment variables
└── README.md
```

---

## 🔌 TMDB Integration

- I search TMDB for movies by title
- Auto-fetch metadata: title, overview, genres, image
- I avoid duplicate entries using TMDB ID

---

## 📁 MongoDB Schema

**Database:** `whatjosiahwatched`\
**Collection:** `Movies`

```ts
{
  id: Number,            // TMDB ID
  title: String,
  overview: String,
  backdrop_path: String,
  genres: [String],
  updatedAt: Date,
  featured: Boolean      // true for the weekly feature
}
```

---

## 🖥️ Admin Dashboard

- Private access only for me
- I can add new movies by title
- I can set one as the featured film
- I can delete existing entries

---

## 📄 Homepage Features

- 🎬 Large banner for my featured movie
- 🧭 Navigation bar (global)
- 🔗 Footer with my social links
- 👻 Secret moving button to access my admin page

---

## 🔃 Bulk Import

- I support `.csv` movie lists
- My script auto-fetches from TMDB and inserts to MongoDB
- Skips duplicates based on TMDB ID

---

## 🔮 Future Features

- 🗳️ User comments and upvotes
- 🧟‍♂️ Filter by genre/date
- 📱 Enhanced mobile UX
- 📊 Watch history visualization

---

## 🎃 Name Origin

> "What Josiah Watched" is both a nod to the 2021 psychological horror film and a personal twist on my Friday night tradition.

---

## 📫 Connect

Made with 💀 by me, Josiah.

---

*Built to terrify and testify to my code.*