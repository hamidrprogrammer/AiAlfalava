/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    }); // Handling for SVG files

    // Ignore all warnings
    config.ignoreWarnings = [
      {
        message: /.*/, // Regular expression to match all warnings
      },
    ];

    return config;
  },
};

if (process.env.DOCKER) {
  nextConfig.output = 'standalone';
}

module.exports = nextConfig;
