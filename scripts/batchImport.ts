// Import dotenv package and load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import { searchMovies, fetchMovieDetails } from '@/lib/tmdb'; // Correct import path
import { MongoClient, Db, Collection, InsertManyResult } from 'mongodb';

// Define an interface for the structure of the movie data we want to store
interface MovieData {
    searchTitle: string; // The title read from the CSV
    foundTitle: string;  // The title found on TMDB
    tmdbId: number;
    overview: string;
    releaseDate: string;
    posterPath?: string;   // Added a poster path
    genres?: string[]; // Added genres
    director?: string; // Director name
    cast?: string[]; // Top cast members
    // Add other fields from TMDB results as needed
}

// --- MongoDB Configuration ---
// Get MongoDB connection string from environment variables
const MONGO_URI = "mongodb+srv://davidtayi19:i7nvab8rseAD1ptA@josiah.u9j92b9.mongodb.net/?retryWrites=true&w=majority&appName=Josiah";
const DB_NAME = 'whatjosiahwatched';
const COLLECTION_NAME = 'Movies';

/**
 * Reads a CSV file containing movie titles (one per line) and returns an array of titles.
 * This is a very basic parser assuming no headers and one title per line.
 * @param filePath Path to the CSV file.
 * @returns An array of movie titles.
 */
function parseSimpleCsv(filePath: string): string[] {
    try {
        console.log(`Reading CSV file from: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/); // Split by new line, handling Windows/Unix endings
        return lines
            .map(line => line.trim()) // Remove leading/trailing whitespace
            .filter(line => line.length > 0); // Filter out empty lines
    } catch (error: any) {
        console.error(`Error reading or parsing CSV file at ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Fetches movie data from TMDB for each title found in the CSV file.
 * @param csvFilePath Path to the CSV file containing movie titles.
 * @returns A promise that resolves to an array of MovieData objects.
 */
async function fetchMovieDataFromCsv(csvFilePath: string): Promise<MovieData[]> {
    const movieTitles = parseSimpleCsv(csvFilePath);

    if (movieTitles.length === 0) {
        console.log("No movie titles found or read from the CSV file.");
        return [];
    }

    console.log(`Found ${movieTitles.length} movie title(s) in CSV. Starting TMDB search...`);

    const allMovieData: MovieData[] = [];
    const notFoundTitles: string[] = [];

    for (const title of movieTitles) {
        try {
            console.log(`\nSearching for movie: "${title}"`);
            const searchResults = await searchMovies(title);

            if (searchResults?.results?.length > 0) {
                const topResult = searchResults.results[0];
                console.log(`   Found: "${topResult.title}" (ID: ${topResult.id})`);
                
                // Fetch additional details (optional)
                const details = await fetchMovieDetails(topResult.id);

                allMovieData.push({
                    searchTitle: title,
                    foundTitle: topResult.title,
                    tmdbId: topResult.id,
                    overview: topResult.overview,
                    director: details?.credits?.crew?.find((c: { job: string; }) => c.job === 'Director')?.name, // Get director name
                    cast: details?.credits?.cast?.slice(0, 5)?.map((c: { name: any; }) => c.name), // Get top 5 cast members
                    releaseDate: topResult.release_date,
                    posterPath: topResult.poster_path,
                    genres: details?.genres?.map((g: { name: any; }) => g.name)
                });
            } else {
                console.warn(`   No results found on TMDB for: "${title}"`);
                notFoundTitles.push(title);
            }

            // IMPORTANT: Add a small delay between API calls to respect TMDB rate limits.
            await new Promise(resolve => setTimeout(resolve, 250));

        } catch (error: any) {
            console.error(`   Error fetching data for "${title}":`, error.message || error);
        }
    }

    console.log("\n----------------------------------------");
    console.log(`TMDB search complete.`);
    console.log(`Successfully fetched data for ${allMovieData.length} movie(s).`);
    if (notFoundTitles.length > 0) {
        console.log(`Could not find TMDB entries for ${notFoundTitles.length} title(s):`);
        notFoundTitles.forEach(t => console.log(`  - ${t}`));
    }
    console.log("----------------------------------------");

    return allMovieData;
}

// --- Main Execution ---

// Pass the CSV file path as a command-line argument or use a default path
// Example usage: npm run import-movies -- ./data/movies.csv
const csvFilePath = process.argv[2] || 'D:\\Documents\\WebDev\\whatjosiahwatched\\data\\movies.csv';

// MONGODB CHANGE: Add async main function to handle DB connection
async function main() {
    // Check if required environment variables are present
    if (!MONGO_URI) {
        console.error("\nFATAL ERROR: MONGO_URI environment variable is not set in your .env file.");
        process.exit(1); // Exit if the connection string is not set
    }

    if (!process.env.TMDB_API_KEY) {
        console.warn("\nWARNING: TMDB_API_KEY environment variable is not set in your .env file.");
    }

    const client = new MongoClient(MONGO_URI);
    let db: Db | null = null; // Define db outside the try block

    try {
        // Connect to MongoDB
        await client.connect();
        db = client.db(DB_NAME); // Assign db instance
        console.log(`\nSuccessfully connected to MongoDB database: ${DB_NAME}`);

        const movieCollection: Collection<MovieData> = db.collection<MovieData>(COLLECTION_NAME);
        console.log(`Using collection: ${COLLECTION_NAME}`);

        // Fetch data from TMDB based on CSV
        const movieData = await fetchMovieDataFromCsv(csvFilePath);

        if (movieData.length > 0) {
            console.log(`\nAttempting to insert ${movieData.length} documents into MongoDB...`);

            // Insert fetched data into the collection
            const insertResult: InsertManyResult<MovieData> = await movieCollection.insertMany(movieData);

            console.log(`Successfully inserted ${insertResult.insertedCount} documents into the '${COLLECTION_NAME}' collection.`);
            if (insertResult.insertedCount !== movieData.length) {
                console.warn(`Note: The number of inserted documents (${insertResult.insertedCount}) does not match the number of fetched movies (${movieData.length}). This might be due to duplicates or other issues if you have custom insertion logic or unique indexes.`);
            }

            // Optionally log the IDs of inserted documents
            // console.log("Inserted document IDs:", insertResult.insertedIds);

        } else {
            console.log("\nNo movie data was fetched, nothing to insert into MongoDB.");
        }

    } catch (error: any) {
        console.error("\nAn error occurred during the MongoDB operation:", error);
        if (error.message && error.message.includes('Authentication failed')) {
            console.error("Authentication failed. Please check your MongoDB username/password in the connection string.");
        } else if (error.message && error.message.includes('queryTxt ETIMEOUT')) {
            console.error("Connection timed out. Please check if your IP address is whitelisted in MongoDB Atlas and the cluster is reachable.");
        }
        // Add more specific error handling if needed
    } finally {
        // Ensure the client is closed when finished or an error occurs
        console.log("\nClosing MongoDB connection...");
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

// Run the main async function
main().catch(err => {
    console.error("Unhandled error in main execution:", err);
    process.exit(1);
});