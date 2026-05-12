import { Context } from "https://edge.netlify.com";

/**
 * Netlify Edge Function: Dynamic Tenant Metadata & Link Previews
 */

const BOT_AGENTS = [
    "facebookexternalhit", "Twitterbot", "LinkedInBot", "WhatsApp", "TelegramBot",
    "Discordbot", "Slackbot", "Pinterest", "SkypeUriPreview"
];

const PROD_API = "https://api.pondokinformatika.id/api";
const DEV_API = "https://api-dev.pondokinformatika.id/api";

export default async (request: Request, context: Context) => {
    const url = new URL(request.url);
    const ua = request.headers.get("user-agent") || "";
    const isBot = BOT_AGENTS.some(bot => ua.includes(bot));

    // Only process HTML requests
    if (request.method !== "GET" || url.pathname.includes(".")) {
        return;
    }

    const response = await context.next();
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
        return response;
    }

    // 1. Infer Tenant & Environment
    const host = request.headers.get("host") || "";
    const isDev = host.includes("dev.");
    const isPestek = host.includes("pesantrenteknologi.id") || host.includes("pestek");

    const tenantId = isPestek ? (isDev ? "pestek-dev" : "pestek") : "pondok_informatika";
    const apiBase = isDev ? DEV_API : PROD_API;

    // 2. Fetch Tenant Settings (with caching if possible, but Edge is short lived)
    let settings = {
        namaPesantren: "Pondok Informatika",
        namaSingkat: "PISANTRI",
        tagline: "Pesantren IT Modern & Sekolah IT Indonesia Timur",
        logo: "https://res.cloudinary.com/duntlhjil/image/upload/f_auto,q_auto/pondok_informatika/branding/logo.png"
    };

    try {
        const apiRes = await fetch(`${apiBase}/public/settings`, {
            headers: { "X-Tenant-ID": tenantId }
        });
        const result = await apiRes.json();
        if (result.success && result.data) {
            settings = { ...settings, ...result.data };
        }
    } catch (e) {
        console.error("Failed to fetch tenant settings:", e);
    }

    let html = await response.text();

    // 3. Dynamic Metadata Replacement
    const title = `${settings.namaPesantren}`;
    const description = settings.tagline || settings.namaPesantren;
    const logo = settings.logo;

    // Replace Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    html = html.replace(/<meta\s+name=["']title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="title" content="${title}">`);
    html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${title}">`);
    html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${title}">`);

    // Replace Description
    html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${description}">`);
    html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${description}">`);
    html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${description}">`);

    // Replace Icons/Logos - More flexible to handle line breaks
    html = html.replace(/<link\s+rel=["']icon["'][\s\S]*?href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="icon" type="image/png" href="${logo}">`);
    html = html.replace(/<link\s+rel=["']apple-touch-icon["'][\s\S]*?href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="apple-touch-icon" href="${logo}">`);

    // 4. Bot-Specific Screenshot Logic
    if (isBot) {
        const isPrivate = url.pathname.startsWith("/admin") ||
            url.pathname.startsWith("/dashboard") ||
            url.pathname.startsWith("/manajemen");

        if (!isPrivate) {
            const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(request.url)}&screenshot=true&embed=screenshot.url&meta=false&waitUntil=networkidle0&colorScheme=dark`;

            html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${screenshotUrl}">`);
            html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${screenshotUrl}">`);
        } else {
            // For private pages, use the tenant logo as fallback image
            html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${logo}">`);
            html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${logo}">`);
        }
    }

    return new Response(html, response);
};
