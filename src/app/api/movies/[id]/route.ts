import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, collectionName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { MovieComment, MovieData } from '@/lib/types';

// PATCH - Add a comment or rating to a movie
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }  // params from the request context
) {
  const id = params.id;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid movie ID format' }, { status: 400 });
  }

  const body = await request.json();
  const { author, content, rating } = body;

  if ((!author || !content) && rating === undefined) {
    return NextResponse.json(
        { error: 'Author name and comment content are required for a comment, or a rating is required' },
        { status: 400 }
    );
  }

  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    return NextResponse.json(
        { error: 'Rating must be a number between 0 and 5' },
        { status: 400 }
    );
  }

  const { db } = await connectToDatabase();
  const movies = db.collection<MovieData>(collectionName);

  if (author && content) {
    const newComment: MovieComment = {
      author,
      content,
      createdAt: new Date()
    };

    const result = await movies.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: {
            comments: {
              $each: [newComment]
            }
          }
        }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    return NextResponse.json(
        { message: 'Comment added successfully', comment: newComment },
        { status: 200 }
    );
  }

  if (rating !== undefined) {
    const result = await movies.updateOne(
        { _id: new ObjectId(id) },
        { $set: { myRating: rating } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    return NextResponse.json(
        { message: 'Rating added successfully', myRating: rating },
        { status: 200 }
    );
  }

  return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 });
}

// DELETE - Remove a movie by ID
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }  // params from the request context
) {
  const id = params.id;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid movie ID format' }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Movie deleted successfully' }, { status: 200 });
}

// GET - Fetch a specific movie by ID
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }  // params from the request context
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
  }

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid movie ID format' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const movie = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 });
  }
}
