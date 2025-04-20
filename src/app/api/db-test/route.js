import { NextResponse } from "next/server";
import { connectToDatabase, collectionName } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });

    const collections = await db.listCollections().toArray();
    const moviesCollectionExists = collections.some(
        (c) => c.name === collectionName
    );

    let documentCount = 0;
    if (moviesCollectionExists) {
      documentCount = await db.collection(collectionName).countDocuments();
    }

    return NextResponse.json({
      status: "connected",
      databaseName: db.databaseName,
      collections: collections.map((c) => c.name),
      moviesCollectionExists,
      documentCount,
    });
  } catch (error) {
    return NextResponse.json(
        {
          status: "error",
          error: String(error),
          message: "Database connection test failed",
          errorStack: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 }
    );
  }
}
