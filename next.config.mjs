/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Autorise les images distantes si tu branches un jour Twitch/TikTok/YouTube en direct
    remotePatterns: [
      { protocol: "https", hostname: "**.twitch.tv" },
      { protocol: "https", hostname: "**.ttvnw.net" },
      { protocol: "https", hostname: "**.ytimg.com" },
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
    ],
  },
};

export default nextConfig;
