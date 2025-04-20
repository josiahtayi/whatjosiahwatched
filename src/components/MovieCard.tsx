"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sfx/creepy-hover.mp3"); // Put your file in the /public/sfx folder
    audioRef.current.volume = 0.3; // Not too loud!
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset in case it overlaps
      audioRef.current.play().catch(() => {}); // Avoid any unhandled errors
    }
  };

  if (!movie._id) return null;

  return (
      <Link href={`/movies/${movie._id}`}>
        <div
            onMouseEnter={playSound}
            className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform hover:scale-[1.03] transition-transform duration-300 hover:ring-2 hover:ring-red-700 group"
        >
          {(movie.posterPath || movie.backdrop_path) ? (
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath || movie.backdrop_path}`}
                    alt={`Poster for ${movie.foundTitle}`}
                    width={500}
                    height={750}
                    className="w-full h-full object-cover transition duration-500 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
          ) : (
              <div className="w-full h-64 bg-zinc-800 flex items-center justify-center text-gray-500 text-sm italic">
                No Image Available
              </div>
          )}

          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold mb-1 text-white line-clamp-2 group-hover:text-red-500 transition-colors">
              {movie.foundTitle}
            </h3>
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
  );
}
