// === Movie Detail Page ===
"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useParams, useRouter} from "next/navigation";
import Footer from "@/components/Footer"; // Assuming Footer can take classNames or is styled globally
import Navbar from "@/components/Navbar"; // Assuming Navbar can take classNames or is styled globally
import CommentSection, {Comment} from "@/components/CommentSection";

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

// Reusable horror container classes
const horrorContainerClasses = "bg-zinc-900 bg-opacity-80 rounded-md p-6 border border-red-900 relative overflow-hidden";
const horrorTextureOverlayClasses = "absolute inset-0 bg-[url('/images/horror-texture.png')] bg-cover opacity-5 mix-blend-overlay pointer-events-none";
const horrorHeadingClasses = "text-2xl font-serif mb-4 text-red-500 flex items-center";


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
                body: JSON.stringify({rating: newRating}),
            });

            if (!response.ok) {
                new Error(`Failed to update rating: ${response.status}`);
            }

            // Optimistically update rating
            setRating(newRating);

            // Update movie state as well
            if (movie) {
                setMovie(prevMovie => prevMovie ? {...prevMovie, rating: newRating} : null);
            }

        } catch (error) {
            console.error("Error updating rating:", error);
            // Revert rating or show an error message to the user
            setError("Failed to update rating"); // Could also revert the rating state here
        }
    };


    // NOTE: Updated getRatingDisplay to use the emoji ratings directly based on the buttons below
    const getRatingDisplay = (ratingValue: number | null) => {
        if (ratingValue === null) return "No rating yet";
        switch (ratingValue) {
            case 5:
                return "🩸🩸";  // Double Blood
            case 4:
                return "🩸";     // Single Blood
            case 3:
                return "🪦";     // Tombstone
            case 2:
                return "💀";     // Skull
            case 1:
                return "💀💀";  // Double Skull
            default:
                return "No rating";
        }
    };

    // The horror aesthetic requires specific backgrounds and colors.
    // Let's wrap the entire loading/error message divs in themed containers.
    if (loading) {
        return (
            // Apply the main background gradient here
            <main
                className="min-h-screen text-shadow-gray-700 bg-gradient-to-br from-black via-gray-950 to-red-900 flex flex-col">
                <Navbar/> {/* Assuming Navbar has the appropriate z-index */}
                <div className="flex-grow flex items-center justify-center p-6"> {/* flex-grow to push footer down */}
                    <div className={`${horrorContainerClasses} text-center max-w-md w-full`}>
                        <div className={horrorTextureOverlayClasses}></div>
                        {/* Texture overlay */}
                        <div className="relative z-10"> {/* Content z-index */}
                            <div className="animate-pulse text-2xl font-serif text-red-400">Gathering dark secrets...
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </main>
        );
    }

    if (error || !movie) {
        return (
            // Apply the main background gradient here
            <main
                className="min-h-screen text-shadow-gray-700 bg-gradient-to-br from-black via-gray-950 to-red-900 flex flex-col">
                <Navbar/>
                <div className="flex-grow flex items-center justify-center p-6">
                    <div
                        className={`${horrorContainerClasses} text-center max-w-md w-full flex flex-col items-center gap-6`}>
                        <div className={horrorTextureOverlayClasses}></div>
                        {/* Texture overlay */}
                        <div className="relative z-10 flex flex-col items-center gap-6"> {/* Content z-index */}
                            <div
                                className="text-2xl font-serif text-red-400">{error || "A presence was not found here..."}</div>
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 bg-red-900 hover:bg-red-800 text-white font-serif rounded-lg transition-colors border border-red-700 shadow-lg" // Themed button
                            >
                                Return From Whence You Came
                            </button>
                        </div>
                    </div>
                </div>
                <Footer/>
            </main>
        );
    }

    return (

        <main
            className="min-h-screen text-shadow-gray-700 bg-gradient-to-br from-black via-gray-950 to-red-900 relative overflow-hidden">
            <Navbar/>
            <section
                className="relative w-full h-[500px] bg-cover bg-center border-b-4 border-red-900" // Added bottom border
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.posterPath})` // Increased bottom gradient opacity
                }}>
                <div className="absolute bottom-0 left-0 w-full p-8 max-w-6xl mx-auto z-10">
                    <button
                        onClick={handleBack}
                        className="mb-6 flex items-center gap-2 text-red-300 hover:text-red-100 font-serif transition-colors" // Themed text color
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Back to the Abyss
                    </button>
                    <h1 className="text-4xl md:text-6xl font-bold font-serif mb-4 text-red-400">{movie.foundTitle}</h1> {/* Themed heading */}
                    {movie.releaseDate && (
                        <p className="text-xl text-red-300 font-serif mb-2"> {/* Themed text */}
                            Unleashed: {new Date(movie.releaseDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    )}
                </div>
            </section>
            <section className="py-12 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                <div className="md:col-span-1 flex flex-col items-center md:items-start gap-6">
                    <div className="w-full max-w-sm"> {/* Constrain poster width */}
                        {(movie.posterPath || movie.backdrop_path) ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${movie.posterPath || movie.backdrop_path}`}
                                alt={`Poster for ${movie.foundTitle}`}
                                width={500}
                                height={750}
                                className="w-full rounded-lg shadow-2xl border border-red-900" // Added border to poster
                            />
                        ) : (
                            <div
                                className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center text-gray-500 font-serif rounded-lg border border-red-900">
                                No Image Available
                            </div>
                        )}
                    </div>


                    {movie.tmdbId && (
                        <a
                            href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full max-w-sm text-center px-4 py-2 bg-red-900 hover:bg-red-800 text-white font-serif font-medium rounded-lg transition-colors border border-red-700 shadow-lg" // Themed button
                        >
                            View on The Movie Database of Horrors
                        </a>
                    )}
                    {movie.genres && movie.genres.length > 0 && (
                        <div className={`${horrorContainerClasses} w-full max-w-sm`}> {/* Apply container styles */}
                            <div className={horrorTextureOverlayClasses}></div>
                            {/* Texture overlay */}
                            <div className="relative z-10"> {/* Content z-index */}
                                <h3 className={`${horrorHeadingClasses}`}>
                                    <span className="mr-2">🏷️</span> Categories of Cruelty
                                </h3> {/* Themed heading */}
                                <div className="flex flex-wrap gap-2">
                                    {movie.genres.map((genre, i) => (
                                        <span key={i}
                                              className="px-3 py-1 bg-red-900 text-red-200 rounded-full text-sm font-serif border border-red-700"> {/* Themed genre tags */}
                                            {genre}
                                         </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-2 flex flex-col gap-10">
                    <div className={horrorContainerClasses}>
                        <div className={horrorTextureOverlayClasses}></div>
                        <div className="relative z-10">
                            <h2 className={`${horrorHeadingClasses}`}>
                                <span className="mr-2">📖</span> The Gruesome Chronicle
                            </h2>
                            <p className="text-red-200 text-lg mb-0 leading-relaxed font-serif">
                                {movie.overview || "No horrifying overview available."}
                            </p>
                        </div>
                    </div>
                    {movie.director && (
                        <div className={horrorContainerClasses}>
                            <div className={horrorTextureOverlayClasses}></div>
                            <div className="relative z-10">
                                <h2 className={`${horrorHeadingClasses}`}>
                                    <span className="mr-2">🎬</span> Master of Mayhem
                                </h2>
                                <p className="text-red-200 text-lg font-serif">{movie.director}</p>
                            </div>
                        </div>
                    )}
                    {movie.cast && movie.cast.length > 0 && (
                        <div className={horrorContainerClasses}>
                            <div className={horrorTextureOverlayClasses}></div>
                            <div className="relative z-10">
                                <h2 className={`${horrorHeadingClasses}`}>
                                    <span className="mr-2">🎭</span> The Unholy Ensemble
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {movie.cast.map((actor, i) => (
                                        <div key={i}
                                             className="bg-red-900 bg-opacity-70 p-4 rounded-lg border border-red-700 font-serif text-red-200">
                                            <p className="font-medium">{actor}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <CommentSection movieId={movie._id || ""} comments={movie.comments || []}
                                    onCommentAction={handleCommentAdded}/>

                    {movie._id && (
                        <div className={`${horrorContainerClasses} bg-opacity-80 border-red-900`}>
                            <div className={horrorTextureOverlayClasses}></div>
                            <div className="relative z-10">
                                <h2 className={`${horrorHeadingClasses}`}>
                                    <span className="mr-2">💉</span> Blood Rating
                                </h2>
                                <div className="flex items-center gap-4 relative z-10">

                                    <button onClick={() => handleRatingChange(5)}
                                            className="text-4xl hover:opacity-70 transition-all hover:scale-110 duration-300 focus:outline-none focus:ring focus:ring-red-500 rounded-md">
                                        🩸🩸
                                    </button>
                                    <button onClick={() => handleRatingChange(4)}
                                            className="text-4xl hover:opacity-70 transition-all hover:scale-110 duration-300 focus:outline-none focus:ring focus:ring-red-500 rounded-md">
                                        🩸
                                    </button>
                                    <button onClick={() => handleRatingChange(3)}
                                            className="text-4xl hover:opacity-70 transition-all hover:scale-110 duration-300 focus:outline-none focus:ring focus:ring-red-500 rounded-md">
                                        🪦
                                    </button>
                                    <button onClick={() => handleRatingChange(2)}
                                            className="text-4xl hover:opacity-70 transition-all hover:scale-110 duration-300 focus:outline-none focus:ring focus:ring-red-500 rounded-md">
                                        💀
                                    </button>
                                    <button onClick={() => handleRatingChange(1)}
                                            className="text-4xl hover:opacity-70 transition-all hover:scale-110 duration-300 focus:outline-none focus:ring focus:ring-red-500 rounded-md">
                                        💀💀
                                    </button>
                                    <span
                                        className="text-2xl font-serif text-red-400 ml-4">({getRatingDisplay(rating)})</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Footer/>
        </main>
    );
}