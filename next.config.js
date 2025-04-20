/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // keep this if needed
    experimental: {
        appDir: true,
    },
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
