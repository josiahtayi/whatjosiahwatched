"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CommentSection, { Comment } from "@/components/CommentSection";
import type { MovieData as Movie } from "@/lib/types";

export default function MovieDetailPage() {
    const params = useParams();
    const router = useRouter();
    const movieId = params.id as string;

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!movieId) return;
        setLoading(true);
        fetch(`/api/movies/${movieId}`)
            .then(res => {
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
            })
            .then(data => setMovie(data))
            .catch(() => setError("Failed to load movie details"))
            .finally(() => setLoading(false));
    }, [movieId]);

    const handleCommentAdded = (newComment: Comment) => {
        setMovie(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-zinc-500 font-serif text-lg animate-pulse">Loading...</p>
                </div>
                <Footer />
            </main>
        );
    }

    if (error || !movie) {
        return (
            <main className="min-h-screen bg-black flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-6">
                    <div className="text-center space-y-6">
                        <p className="text-zinc-400 font-serif text-xl">{error || "This film could not be found."}</p>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2.5 border border-zinc-700 hover:border-red-700 text-zinc-300 hover:text-white font-serif text-sm rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    const backdropUrl = movie.backdrop_path || movie.posterPath;
    const posterUrl = movie.posterPath || movie.backdrop_path;
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            {/* Cinematic hero */}
            <div className="relative w-full h-[65vh] overflow-hidden">
                {backdropUrl && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${backdropUrl}`}
                        alt=""
                        fill
                        className="object-cover object-center"
                        priority
                    />
                )}
                {/* Layered gradients: dark at top for nav, heavy fade at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent" />

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-serif z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Main content — poster overlaps the hero via negative top margin */}
            <div className="max-w-5xl mx-auto px-6 -mt-48 relative z-10 pb-16">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Poster */}
                    <div className="flex-shrink-0 w-full md:w-56">
                        {posterUrl ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${posterUrl}`}
                                alt={`Poster for ${movie.foundTitle}`}
                                width={224}
                                height={336}
                                className="w-full rounded-xl shadow-2xl shadow-black/80 ring-1 ring-white/10"
                            />
                        ) : (
                            <div className="w-full aspect-[2/3] bg-zinc-800 rounded-xl ring-1 ring-white/10 flex items-center justify-center text-zinc-600 text-sm font-serif">
                                No Poster
                            </div>
                        )}
                    </div>

                    {/* Title + metadata */}
                    <div className="flex flex-col justify-end pt-48 md:pt-0 min-w-0">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-white leading-tight mb-3">
                            {movie.foundTitle}
                        </h1>

                        {/* Inline meta row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400 mb-4">
                            {year && <span>{year}</span>}
                            {movie.director && (
                                <>
                                    <span className="text-zinc-700">·</span>
                                    <span>dir. {movie.director}</span>
                                </>
                            )}
                            {movie.watchedDate && (
                                <>
                                    <span className="text-zinc-700">·</span>
                                    <span className="text-red-500">
                                        Watched {new Date(movie.watchedDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Genre tags */}
                        {movie.genres && movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {movie.genres.map((genre, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full ring-1 ring-white/10 font-serif">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {movie.tmdbId && (
                            <Link
                                href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="self-start text-xs text-zinc-500 hover:text-red-400 transition-colors font-serif underline underline-offset-4"
                            >
                                View on TMDB ↗
                            </Link>
                        )}
                    </div>
                </div>

                {/* Overview */}
                {movie.overview && (
                    <div className="mt-10">
                        <p className="text-xs uppercase tracking-widest text-zinc-600 mb-3 font-serif">Overview</p>
                        <p className="text-zinc-300 text-base leading-relaxed max-w-3xl">
                            {movie.overview}
                        </p>
                    </div>
                )}

                {/* Divider */}
                <div className="w-full h-px bg-white/5 my-10" />

                {/* Cast */}
                {movie.cast && movie.cast.length > 0 && (
                    <div className="mb-10">
                        <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4 font-serif">Cast</p>
                        <div className="flex flex-wrap gap-2">
                            {movie.cast.map((actor, i) => (
                                <span key={i} className="px-3 py-1.5 bg-zinc-900 text-zinc-300 text-sm rounded-full ring-1 ring-white/10">
                                    {actor}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="w-full h-px bg-white/5 mb-10" />
                <CommentSection
                    movieId={movie._id || ""}
                    comments={movie.comments || []}
                    onCommentAction={handleCommentAdded}
                />
            </div>

            <Footer />
        </main>
    );
}
