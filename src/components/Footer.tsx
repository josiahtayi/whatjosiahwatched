import { Ghost, Github, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-black text-white py-6 px-6 mt-8 text-center relative overflow-hidden">
            <p className="text-sm tracking-wide">
                © {new Date().getFullYear()} <span className="text-red-600">What Josiah Watched</span>. All rights reserved.
            </p>
            <div className="mt-3 flex justify-center space-x-6 text-white text-sm">
                <a href="https://github.com/josiahtayi" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition duration-300 flex items-center space-x-1">
                    <Github size={16} />
                    <span>GitHub</span>
                </a>
                <a href="https://linkedin.com/in/josiahtayi" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition duration-300 flex items-center space-x-1">
                    <Linkedin size={16} />
                    <span>LinkedIn</span>
                </a>
                <a href="https://instagram.com/justabout_right" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition duration-300 flex items-center space-x-1">
                    <Instagram size={16} />
                    <span>Instagram</span>
                </a>
            </div>

            {/* Floating ghost/skull animation */}
            <Ghost className="absolute left-4 bottom-4 text-red-700 opacity-30 animate-float" size={24} />
            <span className="absolute right-4 bottom-4 text-red-700 opacity-30 animate-float-slow">💀</span>

            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }
            `}</style>
        </footer>
    );
}
