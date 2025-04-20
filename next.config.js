/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // or 'export' if fully static
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