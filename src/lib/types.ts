// lib/types.ts

// TMDB API Types
export interface TMDBPerson {
    id: number;
    name: string;
    job?: string;
    character?: string;
    profile_path?: string | null;
}

export interface TMDBGenre {
    id: number;
    name: string;
}

export interface TMDBCredits {
    cast: TMDBPerson[];
    crew: TMDBPerson[];
}

export interface TMDBMovieDetails {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    genres: TMDBGenre[];
    credits?: TMDBCredits;
    vote_average?: number;
    runtime?: number;
}

// MongoDB Movie Schema
export interface MovieData {
    tmdbId: number;
    foundTitle: string;
    overview: string;
    releaseDate: string;
    posterPath: string | null;
    backdrop_path: string | null;
    genres: string[];
    director: string;
    cast: string[];
    addedAt: Date;
    featured?: boolean;
    watchedDate?: Date;
    myRating?: number;
    comments?: MovieComment[];
}

export interface MovieComment {
    author: string;
    content: string;
    createdAt: Date;
}

export interface RequestParams {
    params: { id: string };
}


// API Response Types
export interface MovieApiResponse {
    success: boolean;
    message: string;
    movieId?: string;
    movies?: MovieData[];
    error?: string;
}