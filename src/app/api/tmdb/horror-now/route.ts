import { NextResponse } from "next/server";
import { fetchHorrorNowPlaying } from "@/lib/tmdb";
import { connectToDatabase, collectionName } from "@/lib/mongodb";

export async function GET() {
    try {
        const [tmdbData, { db }] = await Promise.all([
            fetchHorrorNowPlaying(),
            connectToDatabase(),
        ]);

        // Get tmdbIds already in the collection so we can flag them
        const existing = await db
            .collection(collectionName)
            .find({}, { projection: { tmdbId: 1 } })
            .toArray();
        const existingIds = new Set(existing.map(m => m.tmdbId));

        const results = tmdbData.results.filter(movie => !existingIds.has(movie.id)).slice(0, 18).map(movie => ({
            tmdbId: movie.id,
            foundTitle: movie.title,
            overview: movie.overview,
            releaseDate: movie.release_date,
            posterPath: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            inCollection: existingIds.has(movie.id),
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error("horror-now error:", error);
        return NextResponse.json({ error: "Failed to fetch horror films" }, { status: 500 });
    }
}
