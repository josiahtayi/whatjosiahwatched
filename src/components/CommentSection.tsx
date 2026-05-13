"use client";
import React, { useState } from "react";

export interface Comment {
    author: string;
    content: string;
    createdAt: string | Date;
}

interface CommentSectionProps {
    movieId: string;
    comments?: Comment[];
    onCommentAction: (newComment: Comment) => void;
}

function timeAgo(dateString: string | Date): string {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)   return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function CommentSection({ movieId, comments = [], onCommentAction }: CommentSectionProps) {
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!author.trim()) { setError("Name is required"); return; }
        if (!content.trim()) { setError("Comment is required"); return; }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/movies/${movieId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author, content }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to post comment");
            }
            const data = await res.json();
            onCommentAction(data.comment ?? { author, content, createdAt: new Date() });
            setAuthor("");
            setContent("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to post comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6 font-serif">
                Comments {comments.length > 0 && <span className="text-zinc-700">({comments.length})</span>}
            </p>

            {/* Comment list */}
            {comments.length > 0 && (
                <div className="space-y-5 mb-8">
                    {comments.map((comment, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center text-zinc-400 text-xs font-bold flex-shrink-0">
                                {comment.author[0]?.toUpperCase()}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-semibold text-zinc-200 font-serif">{comment.author}</span>
                                    <span className="text-xs text-zinc-600">{timeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {comments.length === 0 && (
                <p className="text-zinc-600 text-sm mb-8 font-serif italic">No comments yet. Be the first.</p>
            )}

            {/* Comment form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                    <p className="text-red-400 text-xs">{error}</p>
                )}
                <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-zinc-900 border-0 ring-1 ring-white/10 focus:ring-red-700 focus:outline-none text-zinc-200 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-600 transition-shadow"
                />
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Leave a comment..."
                    rows={3}
                    className="w-full bg-zinc-900 border-0 ring-1 ring-white/10 focus:ring-red-700 focus:outline-none text-zinc-200 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-600 transition-shadow resize-none"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-red-900 hover:bg-red-800 text-white text-sm font-serif rounded-lg transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
            </form>
        </div>
    );
}
