// === Navbar.tsx ===

"use client";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full p-4 bg-black text-white flex justify-between items-center shadow-md">
            <Link href="/">
                <span className="text-2xl font-bold tracking-wide">What Josiah Watched</span>
            </Link>
            <div className="space-x-4">
                <Link href="/">Home</Link>
                <Link href="/admin">Admin</Link>
            </div>
        </nav>
    );
}