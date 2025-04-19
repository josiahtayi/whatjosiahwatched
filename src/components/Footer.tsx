// === Footer.tsx ===

export default function Footer() {
    return (
        <footer className="w-full bg-black text-white py-4 px-6 mt-8 text-center">
            <p>© {new Date().getFullYear()} What Josiah Watched. All rights reserved.</p>
            <div className="mt-2 space-x-4">
                <a href="https://x.com" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
                <a href="https://letterboxd.com" target="_blank" rel="noopener noreferrer">Letterboxd</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
        </footer>
    );
}