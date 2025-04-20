// === Movie Detail Page ===
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CommentSection, { Comment } from "@/components/CommentSection";

// Movie interface (same as in homepage)
interface Movie {
    searchTitle?: string;
    foundTitle: string;
    tmdbId: number;
    overview: string;
    releaseDate?: string;
    posterPath?: string;
    backdrop_path?: string;
    genres?: string[];
    director?: string;
    cast?: string[];
    comments?: Comment[];
    _id?: string;
    rating?: number;
}

export default function MovieDetailPage() {
    const params = useParams();
    const router = useRouter();
    const movieId = params.id as string;
    
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rating, setRating] = useState<number | null>(null);

    useEffect(() => {
        if (!movieId) return;

        setLoading(true);
        fetch(`/api/movies/${movieId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch movie: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Movie detail data:", data);
                setMovie(data);
                setRating(data.rating || null);
            })
            .catch(err => {
                console.error("Error fetching movie details:", err);
                setError("Failed to load movie details");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [movieId]);

    const handleBack = () => {
        router.back();
    };

    // Handle new comment added
    const handleCommentAdded = (newComment: Comment) => {
        if (movie) {
            const updatedMovie = { 
                ...movie,
                comments: [...(movie.comments || []), newComment]
            };
            setMovie(updatedMovie);
        }
    };

    const handleRatingChange = async (newRating: number) => {
        try {
            const response = await fetch(`/api/movies/${movieId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating: newRating }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update rating: ${response.status}`);
            }

            setRating(newRating);

            if (movie) {
                const updatedMovie = {
                    ...movie,
                    rating: newRating
                };
                setMovie(updatedMovie);
            }
            
        } catch (error) {
            console.error("Error updating rating:", error);
            setError("Failed to update rating");
        }
    };

    const getRatingDisplay = (ratingValue: number | null) => {
        if (ratingValue === null) return "No rating yet";
        switch (ratingValue) {
            case 5: return "👍👍";  // Double thumbs up
            case 4: return "👍";     // Single thumbs up
            case 3: return "➖";     // Horizontal bar
            case 2: return "👎";     // Single thumbs down
            case 1: return "👎👎";  // Double thumbs down
            default: return "No rating";
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-950 text-white">
                <Navbar />
                <div className="flex items-center justify-center h-[600px]">
                    <div className="animate-pulse text-2xl text-gray-400">Loading movie details...</div>
                </div>
                <Footer />
            </main>
        );
    }

    if (error || !movie) {
        return (
            <main className="min-h-screen bg-zinc-950 text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[600px] gap-6">
                    <div className="text-2xl text-red-400">{error || "Movie not found"}</div>
                    <button 
                        onClick={handleBack}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            {/* Hero Section with Backdrop */}
            <section className="relative w-full h-[500px] bg-cover bg-center" 
                style={{ 
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.posterPath})` 
                }}>
                <div className="absolute bottom-0 left-0 w-full p-8 max-w-6xl mx-auto">
                    <button 
                        onClick={handleBack} 
                        className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Movies
                    </button>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.foundTitle}</h1>
                    {movie.releaseDate && (
                        <p className="text-xl text-gray-300 mb-2">
                            Released: {new Date(movie.releaseDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    )}
                </div>
            </section>
            
            {/* Movie Details Section */}
            <section className="py-12 px-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left Column - Poster and Quick Info */}
                    <div className="md:w-1/3">
                        {(movie.posterPath || movie.backdrop_path) ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${movie.posterPath || movie.backdrop_path}`}
                                alt={`Poster for ${movie.foundTitle}`}
                                width={500}
                                height={750}
                                className="w-full rounded-lg shadow-2xl mb-6"
                            />
                        ) : (
                            <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center text-gray-500 rounded-lg mb-6">
                                No Image Available
                            </div>
                        )}
                        
                        {movie.tmdbId && (
                            <a 
                                href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-4"
                            >
                                View on TMDB
                            </a>
                        )}
                        
                        {movie.genres && movie.genres.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold mb-2">Genres</h3>
                                <div className="flex flex-wrap gap-2">
                                    {movie.genres.map((genre, i) => (
                                        <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-sm">
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column - Details */}
                    <div className="md:w-2/3">
                        <h2 className="text-2xl font-bold mb-4">Overview</h2>
                        <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                            {movie.overview || "No overview available."}
                        </p>
                        
                        {movie.director && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-4">Director</h2>
                                <p className="text-gray-200 text-lg">{movie.director}</p>
                            </div>
                        )}
                        
                        {movie.cast && movie.cast.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {movie.cast.map((actor, i) => (
                                        <div key={i} className="bg-zinc-900 p-4 rounded-lg">
                                            <p className="font-medium">{actor}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Comment Section */}
                        {movie._id && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold mb-4">Rating</h2>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => handleRatingChange(5)} className="text-3xl hover:opacity-70">{rating === 5 ? '' : '👍👍'}</button>
                                        <button onClick={() => handleRatingChange(4)} className="text-3xl hover:opacity-70">{rating === 4 ? '' : '👍'}</button>
                                        <button onClick={() => handleRatingChange(3)} className="text-3xl hover:opacity-70">{rating === 3 ? '' : '➖'}</button>
                                        <button onClick={() => handleRatingChange(2)} className="text-3xl hover:opacity-70">{rating === 2 ? '' : '👎'}</button>
                                        <button onClick={() => handleRatingChange(1)} className="text-3xl hover:opacity-70">{rating === 1 ? '' : '👎👎'}</button>
                                        <span className="text-xl">({getRatingDisplay(rating)})</span>
                                    </div>
                                </div>
                                <CommentSection 
                                    movieId={movie._id}
                                    comments={movie.comments || []}
                                    onCommentAction={handleCommentAdded}
                                />
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

