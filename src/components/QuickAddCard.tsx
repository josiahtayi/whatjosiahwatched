"use client";
import { useState } from "react";
import Image from "next/image";

export interface TmdbPreview {
    tmdbId: number;
    foundTitle: string;
    overview: string;
    releaseDate?: string;
    posterPath?: string | null;
    backdrop_path?: string | null;
    inCollection?: boolean;
}

interface QuickAddCardProps {
    movie: TmdbPreview;
    onAdded?: (tmdbId: number) => void;
}

export default function QuickAddCard({ movie, onAdded }: QuickAddCardProps) {
    const [state, setState] = useState<"idle" | "loading" | "added" | "error">(
        movie.inCollection ? "added" : "idle"
    );

    async function handleAdd() {
        setState("loading");
        try {
            const res = await fetch("/api/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tmdbId: movie.tmdbId }),
            });
            const data = await res.json();
            if (res.ok || data.message === "Movie already exists in database") {
                setState("added");
                onAdded?.(movie.tmdbId);
            } else {
                setState("error");
            }
        } catch {
            setState("error");
        }
    }

    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;

    return (
        <div className="relative bg-zinc-900 rounded-lg overflow-hidden flex flex-col ring-1 ring-white/10 group">
            <div className="relative w-full h-56 overflow-hidden bg-zinc-800">
                {movie.posterPath ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                        alt={movie.foundTitle}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="200px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs italic font-serif">
                        No Image
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            </div>

            <div className="p-3 flex flex-col flex-grow gap-2">
                <div>
                    <h3 className="text-xs font-bold text-white font-serif leading-snug line-clamp-2">
                        {movie.foundTitle}
                    </h3>
                    {year && <p className="text-xs text-zinc-600 mt-0.5">{year}</p>}
                </div>

                <button
                    onClick={handleAdd}
                    disabled={state !== "idle"}
                    className={`mt-auto w-full text-xs font-serif py-1.5 rounded-md transition-colors ${
                        state === "added"
                            ? "bg-zinc-800 text-zinc-500 cursor-default"
                            : state === "loading"
                            ? "bg-zinc-800 text-zinc-400 cursor-wait"
                            : state === "error"
                            ? "bg-red-950 text-red-400"
                            : "bg-red-900 hover:bg-red-800 text-white"
                    }`}
                >
                    {state === "added"
                        ? "In Crypt"
                        : state === "loading"
                        ? "Adding..."
                        : state === "error"
                        ? "Failed — retry?"
                        : "Add to Crypt"}
                </button>
            </div>
        </div>
    );
}
