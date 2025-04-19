import { connectToDatabase, collectionName } from "@/lib/mongodb";
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';


// PUT - Set a movie as featured
export async function PUT(request: NextRequest) {
  try {
    const { movieId } = await request.json();
    
    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // First, remove featured status from all movies
    await db.collection(collectionName).updateMany(
      { featured: true },
      { $set: { featured: false } }
    );
    
    // Then, set the new featured movie
    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(movieId) },
      { $set: { featured: true } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Featured movie updated successfully" 
    });
  } catch (error) {
    console.error("Error setting featured movie:", error);
    return NextResponse.json(
      { error: "Failed to set featured movie" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("API: Fetching featured movie");
    const { db } = await connectToDatabase();

    const featuredMovie = await db.collection(collectionName).findOne({ featured: true });

    if (!featuredMovie) {
      console.warn("No featured movie found in database");
      return NextResponse.json(
        { error: "No featured movie found" },
        { status: 404 }
      );
    }

    console.log("Featured movie:", {
      id: featuredMovie._id,
      title: featuredMovie.foundTitle || featuredMovie.title,
      hasBackdrop: !!featuredMovie.backdrop_path,
      hasPoster: !!featuredMovie.posterPath
    });

    return NextResponse.json(featuredMovie);
  } catch (error) {
    console.error("Failed to fetch featured movie:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured movie", details: String(error) },
      { status: 500 }
    );
  }
}
