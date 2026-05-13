import { MongoClient, ServerApiVersion, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');

    const dbName = process.env.MONGODB_DB || 'whatjosiahwatched';

    if (!cachedClient) {
        cachedClient = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await cachedClient.connect();
    }

    if (!cachedDb) {
        cachedDb = cachedClient.db(dbName);
    }

    return { client: cachedClient, db: cachedDb };
}

export const collectionName = "Movies";