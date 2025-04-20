// === Homepage (page.tsx) ===
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";

// Updated interface to match the MongoDB document structure from our import script
interface Movie {
    searchTitle?: string;
    foundTitle: string;  // This is the actual movie title
    tmdbId: number;
    overview: string;
    releaseDate?: string;
    posterPath?: string;
    backdrop_path?: string; // For compatibility
    genres?: string[];
    director?: string;
    cast?: string[];
    _id?: string; // MongoDB document ID
}

interface DbStatus {
    connected: boolean;
    databaseName?: string;
    collections?: string[];
    moviesCollectionExists?: boolean;
    documentCount?: number;
    error?: string;
}

export default function HomePage() {
    const [feature, setFeature] = useState<Movie | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dbStatus, setDbStatus] = useState<DbStatus>({ connected: false });
    const [debugMode, setDebugMode] = useState(false);

    // First, check database connection
    useEffect(() => {
        fetch("/api/db-test")
            .then(res => res.json())
            .then(data => {
                console.log("Database status:", data);
                setDbStatus({
                    connected: data.status === "connected",
                    databaseName: data.databaseName,
                    collections: data.collections,
                    moviesCollectionExists: data.moviesCollectionExists,
                    documentCount: data.documentCount,
                    error: data.error
                });
                
                if (data.status !== "connected") {
                    setError(`Database connection issue: ${data.error || "Unknown error"}`);
                }
            })
            .catch(err => {
                console.error("Error testing database:", err);
                setDbStatus({ 
                    connected: false,
                    error: err.message
                });
                setError("Failed to check database connection");
            });
    }, []);

    // Then fetch movies if database is connected
    useEffect(() => {
        if (!dbStatus.connected) return;
        
        // Fetch feature movie
        fetch("/api/movies/feature")
            .then(res => {
                console.log("Feature response status:", res.status);
                if (!res.ok) {
                    throw new Error(`Failed to fetch feature: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Feature data:", data);
                setFeature(data);
            })
            .catch(err => {
                console.error("Error fetching feature:", err);
                setError(prev => prev || "Failed to load featured movie");
            });

        // Fetch all movies
        fetch("/api/movies")
            .then(res => {
                console.log("Movies response status:", res.status);
                if (!res.ok) {
                    throw new Error(`Failed to fetch movies: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Movies data:", data);
                if (Array.isArray(data)) {
                    setMovies(data);
                } else if (data.movies && Array.isArray(data.movies)) {
                    setMovies(data.movies);
                    if (data.error) {
                        console.warn("API returned an error:", data.error);
                    }
                } else {
                    console.error("Unexpected data format:", data);
                    setError("Received invalid data format from API");
                }
            })
            .catch(err => {
                console.error("Error fetching movies:", err);
                setError(prev => prev || "Failed to load movies");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dbStatus.connected]);

    // Create a reversed copy of the movies array for rendering
    const reversedMovies = [...movies].reverse();

    // Toggle debug mode with a keyboard shortcut (Ctrl+Shift+D)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                setDebugMode(prev => !prev);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            {/* Section 1: Movie of the Week Banner */}
            {feature && (
                <section className="relative w-full h-[600px] bg-cover bg-center" 
                    style={{ 
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(https://image.tmdb.org/t/p/original${feature.backdrop_path || feature.posterPath})` 
                    }}>
                    <div className="absolute bottom-0 left-0 w-full p-8 max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            {(feature.posterPath || feature.backdrop_path) && (
                                <div className="hidden md:block w-64 h-96 flex-shrink-0">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${feature.posterPath || feature.backdrop_path}`}
                                        alt={`Poster for ${feature.foundTitle}`}
                                        width={256}
                                        height={384}
                                        className="w-full h-full object-cover rounded-lg shadow-2xl"
                                    />
                                </div>
                            )}
                            <div className="flex-grow">
                                <span className="inline-block px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full mb-3">MOVIE OF THE WEEK</span>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">{feature.foundTitle}</h1>
                                {feature.releaseDate && (
                                    <p className="text-gray-300 mb-2">Released: {new Date(feature.releaseDate).toLocaleDateString()}</p>
                                )}
                                {feature.genres && feature.genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {feature.genres.map((genre, i) => (
                                            <span key={i} className="px-2 py-1 bg-zinc-800 text-xs rounded">{genre}</span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-lg text-gray-200 mb-4 max-w-2xl line-clamp-4">{feature.overview}</p>
                                {feature._id && (
                                    <Link 
                                        href={`/movies/${feature._id}`} 
                                        className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                                        View Details
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
            
            {/* Debug Mode Section */}
            {debugMode && (
                <section className="bg-red-900/50 p-4 border border-red-500 m-4 rounded-lg">
                    <h3 className="font-bold">Debug Information</h3>
                    <p>Database: {dbStatus.connected ? 'Connected' : 'Disconnected'}</p>
                    {dbStatus.databaseName && <p>Database Name: {dbStatus.databaseName}</p>}
                    {dbStatus.collections && <p>Collections: {dbStatus.collections.join(', ')}</p>}
                    {dbStatus.documentCount !== undefined && <p>Movies Count: {dbStatus.documentCount}</p>}
                    {dbStatus.error && <p className="text-red-300">Error: {dbStatus.error}</p>}
                    <p>Local State: {movies.length} movies, Feature: {feature ? 'Yes' : 'No'}</p>
                </section>
            )}
            
            {/* Section 2: Movie Collection Display */}
            <section className="py-10 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold">Movie Collection</h2>
                    <div className="text-sm text-gray-400">Showing {reversedMovies.length} movies</div>
                </div>
            
                {loading && <p className="text-center text-lg text-gray-400 py-20">Loading movies...</p>}
                {error && <p className="text-center text-lg text-red-400 py-10">{error}</p>}
            
                {!loading && reversedMovies.length === 0 &&
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400 mb-2">No movies found in database</p>
                        <p className="text-sm text-gray-500">Check your database connection or add some movies</p>
                    </div>
                }
            
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {/* Map over the reversed movies array */}
                    {reversedMovies.map((movie, index) => (
                        <Link href={`/movies/${movie._id}`} key={index}>
                            <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform hover:scale-105 transition-transform">
                                {/* Use posterPath for the image, provide a fallback */}
                                {(movie.posterPath || movie.backdrop_path) ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath || movie.backdrop_path}`}
                                        alt={`Poster for ${movie.foundTitle}`}
                                        width={500}
                                        height={750}
                                        className="w-full h-64 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-zinc-800 flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{movie.foundTitle}</h3>
                                    {movie.releaseDate && (
                                        <p className="text-xs text-gray-500 mb-2">{new Date(movie.releaseDate).getFullYear()}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mb-2 line-clamp-2 flex-grow">{movie.overview}</p>
                                    {movie.genres && movie.genres.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-auto line-clamp-1">{movie.genres.join(", ")}</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}