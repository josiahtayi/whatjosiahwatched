
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri ="mongodb+srv://davidtayi19:i7nvab8rseAD1ptA@josiah.u9j92b9.mongodb.net/?retryWrites=true&w=majority&appName=Josiah";
const dbName = 'whatjosiahwatched';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Cache the client connection to reuse between API calls
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
    // If we already have a connection, use it
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    // If no connection, create a new one
    if (!cachedClient) {
        cachedClient = await client.connect();
    }
    
    if (!cachedDb) {
        cachedDb = cachedClient.db(dbName);
    }

    return { client: cachedClient, db: cachedDb };
}

export const collectionName = "Movies";