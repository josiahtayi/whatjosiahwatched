// lib/tmdb.ts
// Removed the unused import { TMDB } from 'tmdb-ts'

// Use environment variables for an API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'b9fe3c4ce087d7a94be07eca4e7904ba'; // Fallback to an existing key if env var not set

// Define a type for the common paginated response structure from TMDB
interface TMDBPaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

// Import the necessary types from your type file
import { TMDBMovieDetails } from './types';
/**
 * Searches for movies by a query string.
 * Returns a paginated response containing TMDBMovieDetails.
 */
export async function searchMovies(query: string): Promise<TMDBPaginatedResponse<TMDBMovieDetails>> {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to search for movies: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    return response.json();
}

/**
 * Fetches details of a specific movie by its ID.
 * Include credits data for cast and crew information.
 * Returns a single TMDBMovieDetails object which includes credits.
 */
export async function fetchMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch movie details for ID ${movieId}: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    return response.json();
}

/**
 * Fetches now-playing horror films (genre 27) from TMDB.
 */
export async function fetchHorrorNowPlaying(): Promise<TMDBPaginatedResponse<TMDBMovieDetails>> {
    const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27&sort_by=popularity.desc&include_adult=false&language=en-US&page=1`
    );
    if (!response.ok) throw new Error(`TMDB horror-now failed: ${response.status}`);
    return response.json();
}

/**
 * Fetches TMDB recommendations for a given movie ID.
 */
export async function fetchRecommendations(tmdbId: number): Promise<TMDBPaginatedResponse<TMDBMovieDetails>> {
    const response = await fetch(
        `${TMDB_BASE_URL}/movie/${tmdbId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    if (!response.ok) throw new Error(`TMDB recommendations failed: ${response.status}`);
    return response.json();
}
