"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ManualMovieEntry {
    foundTitle: string;
    overview: string;
    genres: string[];
    posterPath?: string;
    director?: string;
}

const inputClass = "w-full bg-zinc-900 ring-1 ring-white/10 focus:ring-red-700 focus:outline-none text-zinc-200 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-600 transition-shadow";
const labelClass = "text-xs uppercase tracking-widest text-zinc-500 font-serif mb-1.5 block";

export default function ManualEntryPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<ManualMovieEntry>({
        foundTitle: "",
        overview: "",
        genres: [],
        posterPath: "",
        director: "",
    });
    const [status, setStatus] = useState("");
    const [genreInput, setGenreInput] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addGenre = () => {
        if (genreInput.trim()) {
            setFormData(prev => ({ ...prev, genres: [...prev.genres, genreInput.trim()] }));
            setGenreInput("");
        }
    };

    const removeGenre = (index: number) => {
        setFormData(prev => ({ ...prev, genres: prev.genres.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("Adding...");
        try {
            console.log("Would submit:", formData);
            setTimeout(() => {
                setStatus("Added successfully.");
                setFormData({ foundTitle: "", overview: "", genres: [], posterPath: "", director: "" });
                setTimeout(() => router.push("/"), 1500);
            }, 1000);
        } catch {
            setStatus("Failed to add film. Please try again.");
        }
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />
            <div className="max-w-xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold font-serif text-white mb-8">Add Film Manually</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input type="text" name="foundTitle" value={formData.foundTitle} onChange={handleChange} className={inputClass} required />
                    </div>

                    <div>
                        <label className={labelClass}>Overview</label>
                        <textarea name="overview" value={formData.overview} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} required />
                    </div>

                    <div>
                        <label className={labelClass}>Director</label>
                        <input type="text" name="director" value={formData.director || ""} onChange={handleChange} className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Poster Path</label>
                        <input
                            type="text"
                            name="posterPath"
                            value={formData.posterPath || ""}
                            onChange={handleChange}
                            placeholder="/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
                            className={inputClass}
                        />
                        <p className="text-xs text-zinc-600 mt-1.5">TMDB poster path (e.g. /abc123.jpg)</p>
                    </div>

                    <div>
                        <label className={labelClass}>Genres</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={genreInput}
                                onChange={e => setGenreInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addGenre())}
                                placeholder="e.g. Horror"
                                className={`${inputClass} flex-grow`}
                            />
                            <button
                                type="button"
                                onClick={addGenre}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-4 py-2 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {formData.genres.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {formData.genres.map((genre, i) => (
                                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full ring-1 ring-white/10">
                                        {genre}
                                        <button type="button" onClick={() => removeGenre(i)} className="text-zinc-500 hover:text-red-400 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-red-900 hover:bg-red-800 text-white font-serif py-2.5 rounded-lg transition-colors text-sm">
                            Add Film
                        </button>
                        {status && <p className="mt-3 text-center text-sm text-zinc-400">{status}</p>}
                    </div>
                </form>
            </div>
            <Footer />
        </main>
    );
}
