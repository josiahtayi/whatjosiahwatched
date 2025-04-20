import { NextResponse } from 'next/server';
import { connectToDatabase, collectionName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/movies/[id]
export async function GET(request, { params }) {
  const id = params.id;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid movie ID format' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const movie = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }

  return NextResponse.json(movie);
}

// PATCH /api/movies/[id]
export async function PATCH(request, { params }) {
  const id = params.id;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid movie ID format' }, { status: 400 });
  }

  const updates = await request.json();

  const db = await connectToDatabase();
  const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Movie updated successfully' });
}

// DELETE /api/movies/[id]
export async function DELETE(request, { params }) {
  const id = params.id;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid movie ID format' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Movie deleted successfully' });
}
