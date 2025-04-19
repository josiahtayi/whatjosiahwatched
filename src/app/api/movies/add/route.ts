import { NextResponse } from "next/server";
import { connectToDatabase, collectionName } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    console.log("API: Adding movie manually");
    
    // Parse the request body
    const movieData = await request.json();
    
    // Validate the essential movie data
    if (!movieData.foundTitle) {
      return NextResponse.json(
        { error: "Movie title is required" },
        { status: 400 }
      );
    }
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Log the data being added
    console.log("Adding movie with data:", movieData);
    
    // Set createdAt timestamp for newer-first sorting (alternative to using _id)
    const movieWithTimestamp = {
      ...movieData,
      createdAt: new Date()
    };
    
    // Insert the movie into the collection
    const result = await db.collection(collectionName).insertOne(movieWithTimestamp);
    
    console.log("Movie added with ID:", result.insertedId);
    
    return NextResponse.json({
      success: true,
      message: "Movie added successfully",
      movieId: result.insertedId
    });
    
  } catch (error) {
    console.error("Failed to add movie:", error);
    return NextResponse.json(
      { error: "Failed to add movie", details: String(error) },
      { status: 500 }
    );
  }
}
