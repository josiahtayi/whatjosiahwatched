import { NextResponse } from "next/server";
import { connectToDatabase, collectionName } from "@/lib/mongodb";
import { fetchMovieDetails } from "@/lib/tmdb";
import { TMDBPerson, TMDBGenre} from '@/lib/types';

export async function GET() {
  try {
    console.log("API: Fetching all movies");
    const { db } = await connectToDatabase();
    
    // Log collection name for debugging
    console.log(`Using collection: ${collectionName}`);
    
    // Check if a collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.error(`Collection '${collectionName}' does not exist`);
      return NextResponse.json(
        { error: `Collection '${collectionName}' not found`, movies: [] },
        { status: 404 }
      );
    }
    
    // Get all movies from the collection
    const movies = await db.collection(collectionName).find({}).toArray();
    
    console.log(`Found ${movies.length} movies in database`);
    
    // Log the first movie for debugging if available
    if (movies.length > 0) {
      console.log("Sample movie data:", {
        id: movies[0]._id,
        title: movies[0].foundTitle || movies[0].title,
        hasBackdrop: !!movies[0].backdrop_path,
        hasPoster: !!movies[0].posterPath
      });
    }
    
    // Return the movie data as JSON
    return NextResponse.json(movies);
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if we have a tmdbId (new approach) or title (old approach)
    if (!body.tmdbId && !body.title) {
      return NextResponse.json(
        { error: "Either tmdbId or title is required" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // If we have a tmdbId, use it to fetch movie details
    if (body.tmdbId) {
      console.log(`API: Adding movie with TMDB ID: ${body.tmdbId}`);
      
      // Check if a movie already exists in a database
      const existingMovie = await db.collection(collectionName).findOne({ tmdbId: body.tmdbId });
      
      if (existingMovie) {
        console.log(`Movie with TMDB ID ${body.tmdbId} already exists in database`);
        return NextResponse.json({ 
          success: false, 
          message: "Movie already exists in database",
          movieId: existingMovie._id
        });
      }
      
      // Fetch movie details from TMDB
      const movieDetails = await fetchMovieDetails(body.tmdbId);
      
      // Extract director and cast from credits
      let director = "";
      let cast: string[] = [];
      
      if (movieDetails.credits) {
        // Find director from crew
        const directorPerson = movieDetails.credits.crew?.find(
          (person: TMDBPerson) => person.job === "Director"
        );
        director = directorPerson?.name || "";
        
        // Get top cast members
        cast = movieDetails.credits.cast
          ?.slice(0, 5)
          .map((person: TMDBPerson) => person.name) || [];
      }
      
      // Format movie data for MongoDB
      const movieData = {
        tmdbId: movieDetails.id,
        foundTitle: movieDetails.title,
        overview: movieDetails.overview,
        releaseDate: movieDetails.release_date,
        posterPath: movieDetails.poster_path,
        backdrop_path: movieDetails.backdrop_path,
        genres: movieDetails.genres?.map((genre: TMDBGenre) => genre.name) || [],
        director,
        cast,
        addedAt: new Date()
      };
      
      // Insert a movie into a database
      const result = await db.collection(collectionName).insertOne(movieData);
      
      if (!result.acknowledged) {
         new Error("Database insert failed");
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Movie added successfully",
        movieId: result.insertedId
      });
    }
    
    // If we only have a title, use the old approach (search and add)
    else if (body.title) {
      console.log(`API: Adding movie with title: ${body.title}`);
      // This is a placeholder for backward compatibility
      // In a real implementation, this would search TMDB and add the first result
      
      return NextResponse.json({ 
        success: true, 
        message: "Movie added via title search (legacy method)",
        title: body.title
      });
    }
  } catch (error) {
    console.error("Failed to add movie:", error);
    return NextResponse.json(
      { error: "Failed to add movie", details: String(error) },
      { status: 500 }
    );
  }
}
