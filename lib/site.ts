// Adresse principale du site (celle sur laquelle Vercel sert les pages).
// Les URL canoniques, le sitemap et le robots.txt s'appuient dessus.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.cycylive.fr").replace(/\/$/, "");
