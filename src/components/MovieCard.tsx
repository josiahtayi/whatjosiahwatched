"use client";
import Image from "next/image";
import Link from "next/link";

interface MovieCardProps {
    movie: {
        _id?: string;
        foundTitle: string;
        posterPath?: string;
        backdrop_path?: string;
        releaseDate?: string;
        overview: string;
        genres?: string[];
    };
}

export default function MovieCard({ movie }: MovieCardProps) {
    if (!movie._id) return null;

    return (
        <Link href={`/movies/${movie._id}`}>
            <div
                className="relative bg-zinc-900 rounded-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:scale-[1.04] hover:ring-2 hover:ring-red-700 hover:shadow-xl hover:shadow-red-900/30 group cursor-pointer"
            >
                {(movie.posterPath || movie.backdrop_path) ? (
                    <div className="relative w-full h-72 overflow-hidden">
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.posterPath || movie.backdrop_path}`}
                            alt={`Poster for ${movie.foundTitle}`}
                            width={500}
                            height={750}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-red-400 font-serif font-bold text-xs uppercase tracking-widest px-4 text-center">
                                View Details
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-72 bg-zinc-800 flex items-center justify-center text-gray-600 text-sm italic font-serif">
                        No Image
                    </div>
                )}

                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold mb-1 text-white line-clamp-2 group-hover:text-red-400 transition-colors font-serif leading-snug">
                        {movie.foundTitle}
                    </h3>
                    {movie.releaseDate && (
                        <p className="text-xs text-gray-600 mb-2">{new Date(movie.releaseDate).getFullYear()}</p>
                    )}
                    {movie.genres && movie.genres.length > 0 && (
                        <p className="text-xs text-red-900 mt-auto font-serif line-clamp-1">
                            {movie.genres.slice(0, 3).join(" · ")}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
