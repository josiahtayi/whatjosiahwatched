import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: Request) {
  try {
    // Get the query parameter from the URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log(`API: Searching TMDB for: "${query}"`);
    
    // Call the TMDB search function from our lib
    const searchResults = await searchMovies(query);
    
    // Return the search results
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("Failed to search TMDB:", error);
    return NextResponse.json(
      { error: "Failed to search TMDB", details: String(error) },
      { status: 500 }
    );
  }
}
