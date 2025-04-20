// src/components/CommentSection.tsx
"use client";
import { useState } from "react";

// Interface for the comment structure
export interface Comment {
  author: string;
  content: string;
  createdAt: string | Date;
}

interface CommentSectionProps {
  movieId: string;
  comments?: Comment[];
  onCommentAdded: (newComment: Comment) => void;
}

export default function CommentSection({
  movieId, 
  comments = [],
  onCommentAdded
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
      return "just now";
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
        body: JSON.stringify({ author, content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add comment");
      }
      
      const data = await response.json();
      
      // Call the parent component callback with the new comment
      onCommentAdded(data.comment);
      
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
    <div className="mt-12 bg-zinc-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      
      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="space-y-6 mb-8">
          {comments.map((comment, index) => (
            <div key={index} className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold">{comment.author}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
              <p className="text-gray-200">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mb-8">No comments yet. Be the first to share your thoughts!</p>
      )}
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-bold">Add a Comment</h3>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="author" className="block text-sm font-medium mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Your Comment
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your thoughts about this movie..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Submitting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
}
