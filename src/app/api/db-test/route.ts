import { NextResponse } from "next/server";
import { connectToDatabase, collectionName } from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("API: Testing database connection");
    
    const { db, client } = await connectToDatabase();
    
    // Test database connection with ping
    await db.command({ ping: 1 });
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    
    // Check if our main collection exists
    const moviesCollectionExists = collections.some(c => c.name === collectionName);
    
    // If our collection exists, get count of documents
    let documentCount = 0;
    if (moviesCollectionExists) {
      documentCount = await db.collection(collectionName).countDocuments();
    }
    
    return NextResponse.json({
      status: "connected",
      databaseName: db.databaseName,
      collections: collections.map(c => c.name),
      moviesCollectionExists,
      documentCount: documentCount
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: String(error),
        message: "Database connection test failed",
        errorStack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
