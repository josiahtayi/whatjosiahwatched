"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import QuickAddCard, { type TmdbPreview } from "@/components/QuickAddCard";
import type { MovieData as Movie } from "@/lib/types";

export default function HomePage() {
    const [feature, setFeature] = useState<Movie | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debugMode, setDebugMode] = useState(false);
    const [horrorNow, setHorrorNow] = useState<TmdbPreview[]>([]);

    useEffect(() => {
        fetch("/api/movies/feature")
            .then(res => res.ok ? res.json() : null)
            .then(data => setFeature(data))
            .catch(() => setFeature(null));

        fetch("/api/movies")
            .then(res => {
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
            })
            .then(data => setMovies(Array.isArray(data) ? data : data.movies ?? []))
            .catch(err => setError(`Failed to load movies (${err.message})`))
            .finally(() => setLoading(false));

        fetch("/api/tmdb/horror-now")
            .then(res => res.ok ? res.json() : [])
            .then(data => setHorrorNow(Array.isArray(data) ? data : []))
            .catch(() => setHorrorNow([]));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === "D") setDebugMode(prev => !prev);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const reversedMovies = [...movies].reverse();

    function handleHorrorAdded(tmdbId: number) {
        setHorrorNow(prev =>
            prev.map(m => m.tmdbId === tmdbId ? { ...m, inCollection: true } : m)
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            {/* Feature hero */}
            {feature && (
                <div className="relative w-full h-[70vh] overflow-hidden">
                    {(feature.backdrop_path || feature.posterPath) && (
                        <Image
                            src={`https://image.tmdb.org/t/p/original${feature.backdrop_path || feature.posterPath}`}
                            alt=""
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 w-full px-8 pb-10 max-w-4xl">
                        <p className="text-xs uppercase tracking-widest text-red-500 font-serif mb-3">
                            Scare of the Week
                        </p>
                        <h1 className="text-4xl md:text-6xl font-bold font-serif text-white leading-tight mb-3">
                            {feature.foundTitle}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400 mb-4">
                            {feature.releaseDate && (
                                <span>{new Date(feature.releaseDate).getFullYear()}</span>
                            )}
                            {feature.genres && feature.genres.length > 0 && (
                                <>
                                    <span className="text-zinc-700">·</span>
                                    <span>{feature.genres.slice(0, 3).join(", ")}</span>
                                </>
                            )}
                        </div>
                        {feature.overview && (
                            <p className="text-zinc-300 text-sm leading-relaxed max-w-xl mb-6 line-clamp-3">
                                {feature.overview}
                            </p>
                        )}
                        {feature._id && (
                            <Link
                                href={`/movies/${feature._id}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-900 hover:bg-red-800 text-white text-sm font-serif rounded-lg transition-colors"
                            >
                                View Film
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Horror section */}
            {horrorNow.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 pt-12 pb-4">
                    <div className="flex items-baseline gap-3 mb-6">
                        <h2 className="text-xl font-bold font-serif text-white tracking-wide">Now in Cinemas</h2>
                        <span className="text-xs text-zinc-600 font-serif uppercase tracking-widest">Horror · Trending</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {horrorNow.map(movie => (
                            <QuickAddCard
                                key={movie.tmdbId}
                                movie={movie}
                                onAdded={handleHorrorAdded}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Debug panel */}
            {debugMode && (
                <div className="bg-zinc-900 ring-1 ring-white/10 rounded-lg p-4 m-6 text-xs text-zinc-400 font-mono space-y-1">
                    <p>Movies: {movies.length}</p>
                    <p>Feature: {feature?.foundTitle ?? "none"}</p>
                    <p>Horror now: {horrorNow.length}</p>
                    {error && <p className="text-red-400">{error}</p>}
                </div>
            )}

            {/* Movie grid */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-baseline mb-8">
                    <h2 className="text-2xl font-bold font-serif text-white tracking-wide">The Crypt</h2>
                    {!loading && (
                        <span className="text-xs text-zinc-600 font-serif uppercase tracking-widest">
                            {reversedMovies.length} films
                        </span>
                    )}
                </div>

                {loading && (
                    <p className="text-center text-zinc-600 py-24 font-serif animate-pulse">
                        Loading...
                    </p>
                )}
                {error && <p className="text-center text-red-400 py-10 text-sm">{error}</p>}

                {!loading && reversedMovies.length === 0 && (
                    <div className="text-center py-24">
                        <p className="text-zinc-500 font-serif">No films in the collection yet.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {reversedMovies.map((movie, index) => (
                        <MovieCard movie={movie} key={movie._id ?? index} />
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
