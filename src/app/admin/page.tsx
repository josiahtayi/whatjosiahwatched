// app/admin/page.tsx

"use client";
import React, { useState, useEffect } from "react";
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
                    setSearchError("No victims found for your search query.");
                }
            } else {
                setSearchError("Invalid response from the other side.");
            }
        } catch (error) {
            console.error("Error searching TMDB:", error);
            setSearchError(`Failed to search: ${error instanceof Error ? error.message : 'Unknown darkness'}`);
        } finally {
            setIsSearching(false);
        }
    }

    // Add a movie to the database
    async function handleAddMovie(movie: TmdbMovie) {
        setIsAdding(true);
        setStatus(`Summoning "${movie.title}" to our realm...`);

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
            setStatus(`💀 "${movie.title}" has been cursed to our collection!`);

            // Refresh movie list
            const moviesRes = await fetch("/api/movies");
            if (moviesRes.ok) {
                const movies = await moviesRes.json();
                setExistingMovies(Array.isArray(movies) ? movies : []);
            }
        } catch (error) {
            console.error("Error adding movie:", error);
            setStatus(`🔥 The ritual failed: ${error instanceof Error ? error.message : 'Unknown evil'}`);
        } finally {
            setIsAdding(false);
        }
    }

    // Set a movie as featured
    async function handleSetFeatured(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFeaturedId) return;

        setStatus("Performing the ritual...");

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
            setStatus("🩸 The chosen one has been marked!");
        } catch (error) {
            console.error("Error setting featured movie:", error);
            setStatus(`🪦 The ritual was interrupted: ${error instanceof Error ? error.message : 'Unknown darkness'}`);
        }
    }

    // Delete a movie from the database
    async function handleDeleteMovie(movieId: string, movieTitle: string) {
        if (!confirm(`Are you sure you want to banish "${movieTitle}" to the void?`)) {
            return;
        }

        setIsDeleting(true);
        setStatus(`Exorcising "${movieTitle}" from our collection...`);

        try {
            const res = await fetch(`/api/movies/${movieId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error(`Failed to delete movie: ${res.status}`);
            }

            setStatus(`🔪 "${movieTitle}" has been banished to the darkness!`);

            // Refresh movie list after deletion
            const moviesRes = await fetch("/api/movies");
            if (moviesRes.ok) {
                const movies = await moviesRes.json();
                setExistingMovies(Array.isArray(movies) ? movies : []);
            }
        } catch (error) {
            console.error("Error deleting movie:", error);
            setStatus(`👻 Failed to banish: ${error instanceof Error ? error.message : 'The spirits interfered'}`);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <main className="min-h-screen text-shadow-gray-700 bg-gradient-to-br from-black via-gray-950 to-red-900">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
                <h1 className="text-4xl font-bold text-center">The Crypt</h1>

                {/* 🔍 Search & Add Movies */}
                <section className="bg-zinc-900 bg-opacity-80 rounded-md p-6 shadow-xl border border-red-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/blood-splatter.png')] opacity-10 bg-cover bg-center pointer-events-none"></div>
                    <h2 className="text-2xl font-serif mb-6 text-red-500 flex items-center relative z-10">
                        <span className="mr-2">🔪</span> Hunt For Fresh Nightmares
                    </h2>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-4 relative z-10">
                        <input
                            type="text"
                            className="flex-grow p-3 bg-zinc-800 border-b-2 border-red-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors rounded-t"
                            placeholder="Whisper the name of your fear..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="bg-red-900 hover:bg-red-800 px-6 py-3 text-white font-medium tracking-wider uppercase transition-all duration-300 transform hover:scale-105 border border-red-700 rounded"
                            disabled={isSearching}
                        >
                            {isSearching ? "Conjuring..." : "Summon"}
                        </button>
                    </form>

                    {searchError && <p className="text-red-400 italic font-serif relative z-10">{searchError}</p>}

                    {searchResults.length > 0 && (
                        <div className="space-y-4 mt-6 relative z-10">
                            <h3 className="text-lg font-medium text-red-400 font-serif border-b border-red-900 pb-2">Unearthed Terrors</h3>
                            {searchResults.slice(0, 5).map((movie) => (
                                <div
                                    key={movie.id}
                                    className="flex bg-zinc-800 bg-opacity-70 rounded overflow-hidden border-l-4 border-red-900 hover:border-red-600 transition-all duration-300 shadow-lg"
                                >
                                    <div className="w-[92px] h-[138px] relative">
                                        {movie.poster_path ? (
                                            <>
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                    alt={movie.title}
                                                    width={92}
                                                    height={138}
                                                    className="object-cover filter hover:sepia hover:contrast-125 transition-all duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/50"></div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs text-red-300 italic font-serif">
                                                Soulless
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h4 className="font-bold text-red-300 font-serif">{movie.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {movie.release_date?.split("-")[0] || "Unknown Era"}
                                        </p>
                                        <p className="text-sm text-gray-400 line-clamp-2 mt-1 italic">
                                            {movie.overview || "This horror's tale remains untold..."}
                                        </p>
                                        <button
                                            onClick={() => handleAddMovie(movie)}
                                            className="mt-3 bg-red-900 hover:bg-red-700 text-white px-4 py-1 rounded shadow hover:shadow-red-900/50 transition-all duration-300 text-sm uppercase tracking-wide font-medium"
                                            disabled={isAdding}
                                        >
                                            {isAdding ? "Conjuring..." : "Trap In Crypt"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 🩸 Feature Movie */}
                <section className="bg-zinc-900 bg-opacity-80 rounded-md p-6 shadow-xl border border-red-900 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[url('/images/pentagram.png')] bg-no-repeat bg-contain opacity-20"></div>
                    <h2 className="text-2xl font-serif mb-6 text-red-500 flex items-center">
                        <span className="mr-2">🩸</span> Choose Your Sacrifice
                    </h2>
                    {isLoadingMovies ? (
                        <p className="text-gray-400 italic font-serif">Awakening the spirits...</p>
                    ) : existingMovies.length === 0 ? (
                        <p className="text-gray-400 italic font-serif">The crypt lies empty. Summon victims first.</p>
                    ) : (
                        <form onSubmit={handleSetFeatured} className="space-y-6">
                            {currentFeaturedMovie && (
                                <p className="text-gray-400 border-l-2 border-red-900 pl-3">
                                    Current Sacrifice: <strong className="text-red-400 font-serif">{currentFeaturedMovie.foundTitle}</strong>
                                </p>
                            )}
                            <div className="relative">
                                <select
                                    className="w-full p-3 bg-zinc-800 border-b-2 border-red-800 text-gray-200 appearance-none rounded-t focus:outline-none focus:border-red-600 transition-colors"
                                    value={selectedFeaturedId}
                                    onChange={(e) => setSelectedFeaturedId(e.target.value)}
                                    required
                                >
                                    <option value="">Select a victim to feature...</option>
                                    {existingMovies.map((movie) => (
                                        <option key={movie._id} value={movie._id!} className="bg-zinc-800">
                                            {movie.foundTitle}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 pointer-events-none">▼</div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-red-900 hover:bg-red-800 px-4 py-3 text-white font-medium tracking-widest uppercase transition-all duration-300 border border-red-800 rounded shadow-lg hover:shadow-red-900/50"
                            >
                                MARK AS SACRIFICIAL OFFERING
                            </button>
                        </form>
                    )}
                </section>

                {/* 🔮 Manage Collection */}
                <section className="bg-zinc-900 bg-opacity-80 rounded-md p-6 shadow-xl border border-red-900 relative">
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[url('/images/fog-texture.png')] bg-no-repeat bg-bottom opacity-5 mix-blend-overlay"></div>
                    <h2 className="text-2xl font-serif mb-6 text-red-500 flex items-center">
                        <span className="mr-2">🪓</span> Crypt Inventory
                    </h2>
                    {isLoadingMovies ? (
                        <p className="text-gray-400 italic">Raising the dead...</p>
                    ) : existingMovies.length === 0 ? (
                        <p className="text-gray-400 italic">The crypt awaits its first victims.</p>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                            {existingMovies.map((movie) => (
                                <div
                                    key={movie._id}
                                    className="flex bg-zinc-800 bg-opacity-60 rounded overflow-hidden border-b border-red-900/30 hover:border-red-700 transition-all duration-300"
                                >
                                    <div className="w-[60px] h-[90px] relative overflow-hidden">
                                        {movie.posterPath ? (
                                            <>
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                                    alt={movie.foundTitle}
                                                    width={60}
                                                    height={90}
                                                    className="object-cover hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs text-red-300 italic">
                                                Phantom
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex-grow relative">
                                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-red-900/5"></div>
                                        <h4 className="font-bold text-red-300 relative z-10">{movie.foundTitle}</h4>
                                        {movie.releaseDate && (
                                            <p className="text-sm text-gray-500 relative z-10">
                                                {new Date(movie.releaseDate).getFullYear()}
                                            </p>
                                        )}
                                        <div className="flex mt-2 relative z-10">
                                            <button
                                                onClick={() =>
                                                    movie._id && handleDeleteMovie(movie._id, movie.foundTitle)
                                                }
                                                className="bg-red-800 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-all duration-300 shadow-md"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Exorcising..." : "BANISH"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 📜 Status Message */}
                {status && (
                    <div className="text-center bg-zinc-900 bg-opacity-70 rounded p-4 border border-red-900/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/images/blood-drip.png')] bg-repeat-x bg-top opacity-20"></div>
                        <p className="text-red-400 font-serif relative z-10 italic">
                            {status}
                        </p>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}