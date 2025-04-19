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
      <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform hover:scale-105 transition-transform">
        {/* Use posterPath for the image, provide a fallback */}
        {(movie.posterPath || movie.backdrop_path) ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.posterPath || movie.backdrop_path}`}
            alt={`Poster for ${movie.foundTitle}`}
            width={500}
            height={750}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-zinc-800 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold mb-1 line-clamp-2">{movie.foundTitle}</h3>
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