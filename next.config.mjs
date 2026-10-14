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
  // En-têtes de sécurité sur toutes les pages
  async headers() {
    const securite = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    return [
      { source: "/:path*", headers: securite },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/valorant", destination: "/gaming", permanent: true },
      { source: "/communaute", destination: "/#communaute", permanent: true },
      { source: "/arcade", destination: "/jeux", permanent: true },
    ];
  },
};

export default nextConfig;
