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

export default function ManualEntryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ManualMovieEntry>({
    foundTitle: "",
    overview: "",
    genres: [],
    posterPath: "",
    director: ""
  });
  const [status, setStatus] = useState("");
  const [genreInput, setGenreInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addGenre = () => {
    if (genreInput.trim()) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }));
      setGenreInput("");
    }
  };

  const removeGenre = (index: number) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Adding movie to database...");

    try {
      console.log("Would submit:", formData);
      
      // Simulate API call success
      setTimeout(() => {
        setStatus("✅ Movie added successfully!");
        // Reset form
        setFormData({
          foundTitle: "",
          overview: "",
          genres: [],
          posterPath: "",
          director: ""
        });
        
        // Redirect back to homepage after a delay
        setTimeout(() => router.push('/'), 1500);
      }, 1000);
    } catch (error) {
      console.error("Error adding movie:", error);
      setStatus("❌ Failed to add movie. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📝 Add Movie Manually</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-6 rounded-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Movie Title</label>
            <input
              type="text"
              name="foundTitle"
              value={formData.foundTitle}
              onChange={handleChange}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Overview</label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Director (optional)</label>
            <input
              type="text"
              name="director"
              value={formData.director || ""}
              onChange={handleChange}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Poster Image URL (optional)</label>
            <input
              type="text"
              name="posterPath"
              value={formData.posterPath || ""}
              onChange={handleChange}
              placeholder="e.g. /pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg from TMDB"
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the path from TMDB (e.g. /pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Genres</label>
            <div className="flex">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                placeholder="Add a genre"
                className="flex-1 p-2 rounded-l bg-zinc-800 border border-zinc-700"
              />
              <button
                type="button"
                onClick={addGenre}
                className="bg-blue-600 px-3 rounded-r"
              >
                Add
              </button>
            </div>
            
            {formData.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.genres.map((genre, index) => (
                  <span 
                    key={index} 
                    className="bg-zinc-800 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(index)}
                      className="ml-1 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
            >
              Add Movie
            </button>
            {status && (
              <p className="mt-3 text-center text-sm">{status}</p>
            )}
          </div>
        </form>
      </div>
      
      <Footer />
    </main>
  );
}
