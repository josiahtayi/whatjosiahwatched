"use client";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [flicker, setFlicker] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFlicker((prev) => !prev);
        }, Math.random() * 1500 + 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="w-full p-4 bg-gradient-to-r from-black via-gray-900 to-black text-white flex justify-between items-center shadow-lg border-b border-red-900 relative overflow-hidden">
            {/* Blood drip effect */}
            <div className="absolute top-full left-0 w-full h-2 bg-red-700 animate-drip" />

            <Link href="/">
                <span className={`text-2xl font-extrabold tracking-wide transition-colors duration-300 ${flicker ? 'text-red-600' : 'text-red-400'} flicker-text`}>
                    What Josiah Watched
                </span>
            </Link>
            <div className="space-x-4 flex items-center">
                <Link href="/" className="hover:text-red-500 transition-colors duration-200">Home</Link>
                <Link href="/admin" aria-label="Admin Area" className="text-white opacity-40 hover:opacity-100 transition-opacity duration-300">
                    <ShieldAlert size={20} />
                </Link>
            </div>

            {/* Additional styles */}
            <style jsx>{`
                @keyframes drip {
                    0% {
                        transform: translateY(-100%);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }

                @keyframes flicker {
                    0%, 100% {
                        opacity: 1;
                    }
                    45% {
                        opacity: 0.4;
                    }
                    55% {
                        opacity: 0.8;
                    }
                    60% {
                        opacity: 0.2;
                    }
                    70% {
                        opacity: 1;
                    }
                }
            `}</style>
        </nav>
    );
}
