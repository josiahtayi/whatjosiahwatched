import { NextRequest, NextResponse } from "next/server";
import { fetchRecommendations } from "@/lib/tmdb";
import { connectToDatabase, collectionName } from "@/lib/mongodb";

export async function GET(
    _request: NextRequest,
    context: { params: { tmdbId: string } }
) {
    const params = await context.params;
    const tmdbId = parseInt(params.tmdbId, 10);

    if (isNaN(tmdbId)) {
        return NextResponse.json({ error: "Invalid TMDB ID" }, { status: 400 });
    }

    try {
        const [tmdbData, { db }] = await Promise.all([
            fetchRecommendations(tmdbId),
            connectToDatabase(),
        ]);

        const existing = await db
            .collection(collectionName)
            .find({}, { projection: { tmdbId: 1 } })
            .toArray();
        const existingIds = new Set(existing.map(m => m.tmdbId));

        const results = tmdbData.results.slice(0, 12).map(movie => ({
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
        console.error("recommendations error:", error);
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}
