// src/app/api/movies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, collectionName } from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

// Interface for the comment structure
interface Comment {
  author: string;
  content: string;
  createdAt: Date;
}

// PATCH - Add a comment or rating to a movie
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID format' },
        { status: 400 }
      );
    }

    // Get comment or rating data from request body
    const { author, content, rating } = await request.json();
    
    // Validate comment or rating data
    if ((!author || !content) && !rating) {
      return NextResponse.json(
        { error: 'Author name and comment content are required' },
        { status: 400 }
      );
    }

    // Validate rating data
    if (rating && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be a number between 0 and 5' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    if (author && content) {
      // Create new comment object with timestamp
      const newComment: Comment = {
        author,
        content,
        createdAt: new Date()
      };
      
      // Add comment to a movie document
      // @ts-ignore
      // @ts-ignore
      const result = await db.collection(collectionName).updateOne(
        { _id: new ObjectId(id) },
        { 
          $push: { 
            comments: newComment 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Comment added successfully',
          comment: newComment 
        },
        { status: 200 }
      );
    }

    if (rating) {
      const result = await db.collection(collectionName).updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            rating: rating
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: 'Rating added successfully',
          rating: rating
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error adding comment or rating:', error);
    return NextResponse.json(
      { error: 'Failed to add comment or rating' },
      { status: 500 }
    );
  }
}

// DELETE a movie by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);

    // Delete the movie
    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Movie deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET a specific movie by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Movie ID is required' },
      { status: 400 }
    );
  }

  try {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID format' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Find movie by ID, converting string ID to MongoDB ObjectId
    const movie = await db.collection(collectionName).findOne({ 
      _id: new ObjectId(id)
    });
    
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}


