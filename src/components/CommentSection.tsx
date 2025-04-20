// src/components/CommentSection.tsx
"use client";
import React, { useState } from "react";

// Interface for the comment structure
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

export default function CommentSection({
                                         movieId,
                                         comments = [],
                                         onCommentAction
                                       }: CommentSectionProps) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date for display using native JavaScript
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
      return "just moments ago"; // Themed
    }

    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Format as a readable date
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setError(null);

    // Validate inputs
    if (!author.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!content.trim()) {
      setError("Please enter a comment");
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit comment to API
      const response = await fetch(`/api/movies/${movieId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        // Assuming the backend expects `author` and `content` for adding a comment
        body: JSON.stringify({ author, content }),
      });

      if (!response.ok) {
        // Attempt to parse error message from backend
        let errorMessage = "Failed to add comment";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Ignore JSON parsing error, use default message
          console.error("Failed to parse error response:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Call the parent component callback with the new comment
      // Assuming the backend returns the newly added comment object in the response data
      if (data.comment) {
        onCommentAction(data.comment);
      } else {
        // Fallback: Manually create a comment object if the backend doesn't return it
        onCommentAction({ author, content, createdAt: new Date() });
      }


      // Reset form
      setAuthor("");
      setContent("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      // Apply the themed container classes to the main div
      <div className="bg-zinc-900 bg-opacity-80 rounded-md p-6 border border-red-900 relative overflow-hidden mt-8">
        {/* Texture overlay */}
        <div className="absolute inset-0 bg-[url('/images/horror-texture.png')] bg-cover opacity-5 mix-blend-overlay pointer-events-none"></div>

        {/* Content goes inside a relative z-10 div */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold font-serif mb-4 text-red-500 flex items-center">
            <span className="mr-2">📝</span> Whispers From Beyond
          </h2> {/* Themed heading */}

          {/* Comment List */}
          {comments.length > 0 ? (
              <div className="space-y-6 mb-8">
                {comments.map((comment, index) => (
                    <div key={index} className="bg-red-900 bg-opacity-70 p-4 rounded-lg border border-red-700"> {/* Themed comment item */}
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-red-200 font-serif">{comment.author}</p> {/* Themed author */}
                        <p className="text-xs text-red-400 font-serif"> {/* Themed date */}
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      <p className="text-red-100 font-serif">{comment.content}</p> {/* Themed content */}
                    </div>
                ))}
              </div>
          ) : (
              <p className="text-red-400 font-serif mb-8">No comments yet. Be the first to share your thoughts!</p>
            )}

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold font-serif mb-2 text-red-400 flex items-center"> {/* Themed form heading */}
              <span className="mr-2">✍️</span> Add a Comment
            </h3>

            {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-200 font-serif px-4 py-3 rounded-lg"> {/* Themed error message */}
                  {error}
                </div>
            )}

            <div>
              <label htmlFor="author" className="block text-sm font-medium font-serif mb-2 text-red-300"> {/* Themed label */}
                Your Name
              </label>
              <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-zinc-950 border border-red-900 text-red-100 font-serif rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-red-600" // Themed input
                  placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium font-serif mb-2 text-red-300"> {/* Themed label */}
                Your Comment
              </label>
              <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950 border border-red-900 text-red-100 font-serif rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-red-600" // Themed textarea
                  placeholder="Share your thoughts about this movie..."
              />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-red-900 hover:bg-red-800 text-white font-serif font-medium rounded-lg transition-colors border border-red-700 shadow-lg ${ // Themed button
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {isSubmitting ? "Submitting..." : "Post Comment"} {/* Themed button text */}
            </button>
          </form>
        </div>
      </div>
  );
}