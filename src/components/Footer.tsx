import { Ghost, Github, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-black text-white pt-10 pb-6 px-6 mt-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-800/50 to-transparent" />

            <p className="text-xs tracking-widest font-serif text-red-900 uppercase mb-5">
                © {new Date().getFullYear()} What Josiah Watched
            </p>

            <div className="flex justify-center gap-8 text-sm mb-2">
                <a href="https://github.com/josiahtayi" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 transition-colors duration-300">
                    <Github size={15} /><span>GitHub</span>
                </a>
                <a href="https://linkedin.com/in/josiahtayi" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 transition-colors duration-300">
                    <Linkedin size={15} /><span>LinkedIn</span>
                </a>
                <a href="https://instagram.com/justabout_right" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 transition-colors duration-300">
                    <Instagram size={15} /><span>Instagram</span>
                </a>
            </div>

            <Ghost className="absolute left-4 bottom-4 text-red-900/40 animate-float" size={20} />
            <span className="absolute right-5 bottom-4 text-red-900/40 animate-float-slow text-lg">💀</span>
        </footer>
    );
}
