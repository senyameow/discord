const { config } = require('process')

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => { // добавляем эту штуку, чтобы работать с сокетом ио
        config.externals.push({
            "utf-8-validate": "commonjs utf-8-validate",
            bufferutil: "commonjs bufferutil"
        });
        return config
    },
    images: {
        domains: [
            'uploadthing.com',
        ]
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    }
}

module.exports = nextConfig
