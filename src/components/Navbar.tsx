"use client";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full px-6 py-4 bg-black/85 backdrop-blur-md text-white flex justify-between items-center border-b border-red-900/50 shadow-lg shadow-black/50">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-800/60 to-transparent" />
            <Link href="/">
                <span className="text-2xl font-extrabold tracking-wide font-serif text-red-500 animate-flicker">
                    What Josiah Watched
                </span>
            </Link>
            <Link href="/admin" aria-label="Admin Area" className="text-white opacity-25 hover:opacity-100 transition-opacity duration-300">
                <ShieldAlert size={20} />
            </Link>
        </nav>
    );
}
