/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'phaser': 'phaser/dist/phaser.js'
    };
    return config;
  }
};

export default nextConfig;
