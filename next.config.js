/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/whatjosiahwatched',
    output: 'export', // keep this if needed
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
                pathname: '**',
            },
        ],
    },
};

module.exports = nextConfig;
