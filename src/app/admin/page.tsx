// app/admin/page.tsx

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Movie interface similar to the one in the homepage
interface Movie {
    _id?: string;
    tmdbId: number;
    foundTitle: string;
    overview: string;
    releaseDate?: string;
    posterPath?: string;
    backdrop_path?: string;
    genres?: string[];
}

// TMDB search result interface
interface TmdbMovie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    genre_ids: number[];
}

export default function AdminPage() {
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<TmdbMovie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    
    // Add movie state
    const [status, setStatus] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Existing movies for feature setting
    const [existingMovies, setExistingMovies] = useState<Movie[]>([]);
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [selectedFeaturedId, setSelectedFeaturedId] = useState<string>("");
    const [currentFeaturedMovie, setCurrentFeaturedMovie] = useState<Movie | null>(null);

    // Fetch existing movies from the feature section
    useEffect(() => {
        async function fetchMovies() {
            try {
                const response = await fetch("/api/movies");
                if (response.ok) {
                    const movies = await response.json();
                    setExistingMovies(Array.isArray(movies) ? movies : []);
                }
            } catch (error) {
                console.error("Failed to fetch existing movies:", error);
            } finally {
                setIsLoadingMovies(false);
            }
        }

        async function fetchFeaturedMovie() {
            try {
                const response = await fetch("/api/movies/feature");
                if (response.ok) {
                    const movie = await response.json();
                    setCurrentFeaturedMovie(movie);
                    setSelectedFeaturedId(movie._id || "");
                } else {
                    setCurrentFeaturedMovie(null);
                    setSelectedFeaturedId("");
                    console.warn("No featured movie found or error fetching.");
                }
            } catch (error) {
                console.error("Failed to fetch featured movie:", error);
                setCurrentFeaturedMovie(null);
                setSelectedFeaturedId("");
            }
        }

        fetchMovies();
        fetchFeaturedMovie();
    }, []);

    // Search TMDB for movies
    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        setSearchError("");
        setSearchResults([]);
        
        try {
            const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`);
            
            if (!response.ok) {
                throw new Error(`Search failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.results && Array.isArray(data.results)) {
                setSearchResults(data.results);
                if (data.results.length === 0) {
                    setSearchError("No movies found for your search query.");
                }
            } else {
                setSearchError("Invalid response format from TMDB API.");
            }
        } catch (error) {
            console.error("Error searching TMDB:", error);
            setSearchError(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSearching(false);
        }
    }

    // Add a movie to the database
    async function handleAddMovie(movie: TmdbMovie) {
        setIsAdding(true);
        setStatus(`Adding "${movie.title}" to database...`);
        
        try {
            const res = await fetch("/api/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tmdbId: movie.id }),
            });
            
            if (!res.ok) {
                throw new Error(`Failed to add movie: ${res.status}`);
            }
            await res.json();
            setStatus(`✅ Movie "${movie.title}" added successfully!`);
            
            // Refresh movie list
            const moviesRes = await fetch("/api/movies");
            if (moviesRes.ok) {
                const movies = await moviesRes.json();
                setExistingMovies(Array.isArray(movies) ? movies : []);
            }
        } catch (error) {
            console.error("Error adding movie:", error);
            setStatus(`❌ Failed to add movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsAdding(false);
        }
    }

    // Set a movie as featured
    async function handleSetFeatured(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFeaturedId) return;
        
        setStatus("Setting featured movie...");
        
        try {
            const res = await fetch("/api/movies/feature", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieId: selectedFeaturedId }),
            });
            
            if (!res.ok) {
                throw new Error(`Failed to set featured movie: ${res.status}`);
            }
            await res.json();
            setStatus("✅ Featured movie updated successfully!");
        } catch (error) {
            console.error("Error setting featured movie:", error);
            setStatus(`❌ Failed to set featured movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Delete a movie from the database
    async function handleDeleteMovie(movieId: string, movieTitle: string) {
        if (!confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
            return;
        }

        setIsDeleting(true);
        setStatus(`Deleting "${movieTitle}" from database...`);

        try {
            const res = await fetch(`/api/movies/${movieId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error(`Failed to delete movie: ${res.status}`);
            }

            setStatus(`✅ Movie "${movieTitle}" deleted successfully!`);

            // Refresh movie list after deletion
            const moviesRes = await fetch("/api/movies");
            if (moviesRes.ok) {
                const movies = await moviesRes.json();
                setExistingMovies(Array.isArray(movies) ? movies : []);
            }
        } catch (error) {
            console.error("Error deleting movie:", error);
            setStatus(`❌ Failed to delete movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-8 text-center">🛠️ Admin Panel</h1>
                
                {/* Movie Search Section */}
                <section className="bg-zinc-900 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🔍 Search &amp; Add Movies</h2>
                    <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
                        <input
                            type="text"
                            placeholder="Search for a movie..."
                            className="flex-grow p-3 rounded-lg text-black"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                            disabled={isSearching}
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </form>
                    
                    {searchError && (
                        <div className="text-red-400 mb-4">{searchError}</div>
                    )}
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Search Results</h3>
                            {searchResults.slice(0, 5).map((movie) => (
                                <div key={movie.id} className="flex bg-zinc-800 rounded-lg overflow-hidden">
                                    {movie.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                            alt={movie.title}
                                            width={92}
                                            height={138}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-[92px] h-[138px] bg-zinc-700 flex items-center justify-center text-xs text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="p-4 flex-grow">
                                        <h4 className="font-bold">{movie.title}</h4>
                                        {movie.release_date && (
                                            <p className="text-sm text-gray-400">
                                                {new Date(movie.release_date).getFullYear()}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                                            {movie.overview || "No overview available."}
                                        </p>
                                        <button
                                            onClick={() => handleAddMovie(movie)}
                                            className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                                            disabled={isAdding}
                                        >
                                            {isAdding ? "Adding..." : "Add to Database"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                
                {/* Set Featured Movie Section */}
                <section className="bg-zinc-900 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🌟 Set Featured Movie</h2>
                    
                    {isLoadingMovies ? (
                        <p className="text-gray-400">Loading movies...</p>
                    ) : existingMovies.length === 0 ? (
                        <p className="text-gray-400">No movies available. Add some movies first.</p>
                    ) : (
                        <form onSubmit={handleSetFeatured} className="space-y-4">
                            {currentFeaturedMovie && (
                                <div className="mb-2">
                                    <p className="text-gray-400">
                                        Currently Featured: {currentFeaturedMovie.foundTitle}
                                    </p>
                                </div>
                            )}
                            <div className="w-full">
                                <select
                                    className="w-full p-3 rounded-lg text-black"
                                    value={selectedFeaturedId || ""}
                                    onChange={(e) => setSelectedFeaturedId(e.target.value)}
                                    required
                                >
                                    <option value="">Select a movie...</option>
                                    {existingMovies.map((movie) => (
                                        <option key={movie._id} value={movie._id!}>
                                            {movie.foundTitle}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                disabled={!selectedFeaturedId}
                            >
                                Set as Featured Movie
                            </button>
                        </form>
                    )}
                </section>
                
                {/* Manage Movies Section */}
                <section className="bg-zinc-900 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">🎬 Manage Movies</h2>
                    
                    {isLoadingMovies ? (
                        <p className="text-gray-400">Loading movies...</p>
                    ) : existingMovies.length === 0 ? (
                        <p className="text-gray-400">No movies available. Add some movies first.</p>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Movie Database</h3>
                            <div className="max-h-96 overflow-y-auto">
                                {existingMovies.map((movie) => (
                                    <div key={movie._id} className="flex bg-zinc-800 rounded-lg overflow-hidden mb-3">
                                        {movie.posterPath ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                                alt={movie.foundTitle}
                                                width={60}
                                                height={90}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-[60px] h-[90px] bg-zinc-700 flex items-center justify-center text-xs text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <div className="p-3 flex-grow">
                                            <h4 className="font-bold">{movie.foundTitle}</h4>
                                            {movie.releaseDate && (
                                                <p className="text-sm text-gray-400">
                                                    {new Date(movie.releaseDate).getFullYear()}
                                                </p>
                                            )}
                                            <div className="flex mt-1">
                                                <button
                                                    onClick={() => movie._id && handleDeleteMovie(movie._id, movie.foundTitle)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Status Messages */}
                {status && (
                    <div className="mt-6 p-4 bg-zinc-800 rounded-lg text-center">
                        {status}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}

