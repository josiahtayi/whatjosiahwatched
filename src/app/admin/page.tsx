"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { MovieData as Movie } from "@/lib/types";

interface TmdbMovie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    genre_ids: number[];
}

const inputClass = "w-full bg-zinc-900 ring-1 ring-white/10 focus:ring-red-700 focus:outline-none text-zinc-200 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-600 transition-shadow";
const sectionClass = "bg-zinc-900/50 ring-1 ring-white/10 rounded-xl p-6";
const labelClass = "text-xs uppercase tracking-widest text-zinc-500 font-serif mb-4 block";
const primaryBtn = "bg-red-900 hover:bg-red-800 text-white font-serif text-sm rounded-lg px-4 py-2 transition-colors disabled:opacity-50";
const secondaryBtn = "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-4 py-2 transition-colors";

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<TmdbMovie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    const [status, setStatus] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const [existingMovies, setExistingMovies] = useState<Movie[]>([]);
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [selectedFeaturedId, setSelectedFeaturedId] = useState("");
    const [currentFeaturedMovie, setCurrentFeaturedMovie] = useState<Movie | null>(null);

    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const [editForm, setEditForm] = useState({ foundTitle: "", director: "", overview: "" });
    const [isSaving, setIsSaving] = useState(false);

    const [pendingDelete, setPendingDelete] = useState<Movie | null>(null);
    const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
            if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        };
    }, []);

    function flashStatus(msg: string) {
        setStatus(msg);
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => setStatus(""), 4000);
    }

    useEffect(() => {
        if (sessionStorage.getItem("admin_authed") === "true") setAuthed(true);
    }, []);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError("");
        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) { setAuthError("Incorrect password."); return; }
            sessionStorage.setItem("admin_authed", "true");
            setAuthed(true);
        } catch {
            setAuthError("Failed to reach the server.");
        } finally {
            setAuthLoading(false);
        }
    }

    useEffect(() => {
        if (!authed) return;

        fetch("/api/movies")
            .then(res => res.ok ? res.json() : [])
            .then(movies => setExistingMovies(Array.isArray(movies) ? movies : []))
            .catch(() => {})
            .finally(() => setIsLoadingMovies(false));

        fetch("/api/movies/feature")
            .then(res => res.ok ? res.json() : null)
            .then(movie => {
                setCurrentFeaturedMovie(movie);
                setSelectedFeaturedId(movie?._id || "");
            })
            .catch(() => {});
    }, [authed]);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchError("");
        setSearchResults([]);
        try {
            const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();
            if (data.results?.length) {
                setSearchResults(data.results);
            } else {
                setSearchError("No results found.");
            }
        } catch (err) {
            setSearchError(`Search failed: ${err instanceof Error ? err.message : "unknown error"}`);
        } finally {
            setIsSearching(false);
        }
    }

    async function handleAddMovie(movie: TmdbMovie) {
        setIsAdding(true);
        flashStatus(`Adding "${movie.title}"...`);
        try {
            const res = await fetch("/api/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tmdbId: movie.id }),
            });
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();
            if (!data.success) { flashStatus(`"${movie.title}" is already in the collection.`); return; }
            flashStatus(`"${movie.title}" added.`);
            const moviesRes = await fetch("/api/movies");
            if (moviesRes.ok) setExistingMovies(await moviesRes.json());
        } catch (err) {
            flashStatus(`Failed to add: ${err instanceof Error ? err.message : "error"}`);
        } finally {
            setIsAdding(false);
        }
    }

    function openEdit(movie: Movie) {
        setEditingMovie(movie);
        setEditForm({ foundTitle: movie.foundTitle, director: movie.director || "", overview: movie.overview });
    }

    async function handleEditSave(e: React.FormEvent) {
        e.preventDefault();
        if (!editingMovie?._id) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/movies/${editingMovie._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieUpdate: editForm }),
            });
            if (!res.ok) throw new Error(`${res.status}`);
            setExistingMovies(prev => prev.map(m => m._id === editingMovie._id ? { ...m, ...editForm } : m));
            setEditingMovie(null);
            flashStatus(`"${editForm.foundTitle}" updated.`);
        } catch (err) {
            flashStatus(`Save failed: ${err instanceof Error ? err.message : "error"}`);
        } finally {
            setIsSaving(false);
        }
    }

    function handleDeleteMovie(movie: Movie) {
        if (!movie._id) return;
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        setExistingMovies(prev => prev.filter(m => m._id !== movie._id));
        setPendingDelete(movie);
        deleteTimerRef.current = setTimeout(async () => {
            try {
                await fetch(`/api/movies/${movie._id}`, { method: "DELETE" });
                flashStatus(`"${movie.foundTitle}" deleted.`);
            } catch {
                flashStatus(`Failed to delete "${movie.foundTitle}".`);
                setExistingMovies(prev => [...prev, movie]);
            }
            setPendingDelete(null);
        }, 5000);
    }

    function handleUndoDelete() {
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        if (pendingDelete) {
            setExistingMovies(prev => [...prev, pendingDelete]);
            setPendingDelete(null);
        }
    }

    async function handleSetFeatured(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFeaturedId) return;
        try {
            const res = await fetch("/api/movies/feature", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieId: selectedFeaturedId }),
            });
            if (!res.ok) throw new Error(`${res.status}`);
            const selected = existingMovies.find(m => m._id === selectedFeaturedId) || null;
            setCurrentFeaturedMovie(selected);
            flashStatus("Featured film updated.");
        } catch (err) {
            flashStatus(`Failed: ${err instanceof Error ? err.message : "error"}`);
        }
    }

    if (!authed) {
        return (
            <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
                <div className="w-full max-w-sm space-y-6">
                    <h1 className="text-2xl font-bold font-serif text-white text-center">Admin</h1>
                    <form onSubmit={handleLogin} className="space-y-3">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className={inputClass}
                            autoFocus
                        />
                        {authError && <p className="text-red-400 text-xs">{authError}</p>}
                        <button type="submit" disabled={authLoading} className={`w-full py-2.5 ${primaryBtn}`}>
                            {authLoading ? "Verifying..." : "Enter"}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

                <div className="flex items-baseline justify-between">
                    <h1 className="text-2xl font-bold font-serif text-white">Admin</h1>
                    {status && <p className="text-sm text-zinc-400 italic">{status}</p>}
                </div>

                {/* Search & add */}
                <section className={sectionClass}>
                    <p className={labelClass}>Add a Film</p>
                    <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                        <input
                            type="text"
                            className={`${inputClass} flex-grow`}
                            placeholder="Search TMDB..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={isSearching} className={primaryBtn}>
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </form>

                    {searchError && <p className="text-zinc-500 text-sm">{searchError}</p>}

                    {searchResults.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <div className="w-full h-px bg-white/5" />
                            {searchResults.slice(0, 5).map(movie => {
                                const alreadyAdded = existingMovies.some(m => m.tmdbId === movie.id);
                                return (
                                    <div key={movie.id} className="flex gap-3 items-start py-2">
                                        <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                                            {movie.poster_path && (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                    alt={movie.title}
                                                    width={40}
                                                    height={60}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-semibold text-zinc-200 font-serif">{movie.title}</p>
                                            <p className="text-xs text-zinc-600 mb-2">{movie.release_date?.split("-")[0]}</p>
                                            {alreadyAdded ? (
                                                <span className="text-xs text-zinc-600 italic">Already in collection</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddMovie(movie)}
                                                    disabled={isAdding}
                                                    className={secondaryBtn}
                                                >
                                                    {isAdding ? "Adding..." : "Add to collection"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Set featured */}
                <section className={sectionClass}>
                    <p className={labelClass}>Featured Film</p>
                    {isLoadingMovies ? (
                        <p className="text-zinc-600 text-sm">Loading...</p>
                    ) : existingMovies.length === 0 ? (
                        <p className="text-zinc-600 text-sm italic">No films in the collection yet.</p>
                    ) : (
                        <form onSubmit={handleSetFeatured} className="flex gap-3">
                            <select
                                className={`${inputClass} flex-grow appearance-none`}
                                value={selectedFeaturedId}
                                onChange={e => setSelectedFeaturedId(e.target.value)}
                                required
                            >
                                <option value="">Select a film...</option>
                                {existingMovies.map(movie => (
                                    <option key={movie._id} value={movie._id!} className="bg-zinc-900">
                                        {movie.foundTitle}{currentFeaturedMovie?._id === movie._id ? " ★" : ""}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className={primaryBtn}>Set Featured</button>
                        </form>
                    )}
                </section>

                {/* Collection */}
                <section className={sectionClass}>
                    <p className={labelClass}>Collection · {existingMovies.length} films</p>
                    {isLoadingMovies ? (
                        <p className="text-zinc-600 text-sm">Loading...</p>
                    ) : existingMovies.length === 0 ? (
                        <p className="text-zinc-600 text-sm italic">Nothing here yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {existingMovies.map(movie => (
                                <div key={movie._id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                    <div className="w-8 h-12 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                                        {movie.posterPath && (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                                alt={movie.foundTitle}
                                                width={32}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-zinc-200 font-serif truncate">{movie.foundTitle}</p>
                                            {currentFeaturedMovie?._id === movie._id && (
                                                <span className="text-xs text-red-500 font-serif flex-shrink-0">★ Featured</span>
                                            )}
                                        </div>
                                        {movie.releaseDate && (
                                            <p className="text-xs text-zinc-600">{new Date(movie.releaseDate).getFullYear()}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => openEdit(movie)} className={secondaryBtn}>Edit</button>
                                        <button onClick={() => handleDeleteMovie(movie)} className="bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-white text-sm rounded-lg px-3 py-1.5 transition-colors">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Undo toast */}
            {pendingDelete && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-800 ring-1 ring-white/10 text-white px-5 py-3 rounded-lg shadow-2xl z-50 text-sm">
                    <span className="text-zinc-300">"{pendingDelete.foundTitle}" will be deleted</span>
                    <button onClick={handleUndoDelete} className="text-red-400 hover:text-red-300 font-semibold">Undo</button>
                </div>
            )}

            {/* Edit modal */}
            {editingMovie && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 ring-1 ring-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl">
                        <h2 className="text-lg font-bold font-serif text-white mb-5">Edit Film</h2>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-widest font-serif mb-1.5 block">Title</label>
                                <input type="text" value={editForm.foundTitle} onChange={e => setEditForm(f => ({ ...f, foundTitle: e.target.value }))} className={inputClass} required />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-widest font-serif mb-1.5 block">Director</label>
                                <input type="text" value={editForm.director} onChange={e => setEditForm(f => ({ ...f, director: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-widest font-serif mb-1.5 block">Overview</label>
                                <textarea value={editForm.overview} onChange={e => setEditForm(f => ({ ...f, overview: e.target.value }))} rows={4} className={`${inputClass} resize-none`} />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="submit" disabled={isSaving} className={`flex-1 py-2.5 ${primaryBtn}`}>
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                                <button type="button" onClick={() => setEditingMovie(null)} className={`px-6 py-2.5 ${secondaryBtn}`}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
