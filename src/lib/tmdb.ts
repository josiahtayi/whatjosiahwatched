import { TMDB } from 'tmdb-ts'
// Use environment variables for API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'b9fe3c4ce087d7a94be07eca4e7904ba'; // Fallback to existing key if env var not set

/**
 * Fetches popular movies from TMDB.
 */
export async function fetchPopularMovies(): Promise<any> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    if (!response.ok) {
        throw new Error('Failed to fetch popular movies');
    }
    return response.json();
}

/**
 * Searches for movies by a query string.
 */
export async function searchMovies(query: string): Promise<any> {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Failed to search for movies');
    }
    return response.json();
}

/**
 * Fetches details of a specific movie by its ID.
 * Includes credits data for cast and crew information.
 */
export async function fetchMovieDetails(movieId: number): Promise<any> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
    if (!response.ok) {
        throw new Error('Failed to fetch movie details');
    }
    return response.json();
}
