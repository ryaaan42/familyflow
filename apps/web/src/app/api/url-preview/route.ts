import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type UrlPreview = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  price?: string;
  url: string;
};

const META_PATTERNS: Array<[keyof Omit<UrlPreview, "url">, RegExp[]]> = [
  ["title", [/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i, /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:title|twitter:title)["']/i, /<title[^>]*>([^<]+)</i]],
  ["description", [/<meta[^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["'][^>]+content=["']([^"']+)["']/i, /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["']/i]],
  ["image", [/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i, /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i]],
  ["siteName", [/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i]],
  ["price", [/<meta[^>]+(?:property|name)=["'](?:product:price:amount|price|twitter:data1)["'][^>]+content=["']([^"']+)["']/i, /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:product:price:amount|price|twitter:data1)["']/i]]
];

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractMeta(html: string, baseUrl: URL): UrlPreview {
  const preview: UrlPreview = { url: baseUrl.toString() };

  const resolveMaybeRelativeUrl = (value: string) => {
    try {
      return new URL(value, baseUrl).toString();
    } catch {
      return value;
    }
  };

  for (const [field, patterns] of META_PATTERNS) {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      const value = match?.[1] ? decodeHtmlEntities(match[1]) : "";
      if (!value) continue;
      if (field === "image") {
        preview[field] = resolveMaybeRelativeUrl(value);
      } else {
        preview[field] = value;
      }
      break;
    }
  }

  if (!preview.siteName) {
    preview.siteName = baseUrl.hostname.replace(/^www\./, "");
  }

  return preview;
}

const isPrivateHost = (hostname: string) => {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
  return /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
};

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) return NextResponse.json({ error: "URL manquante" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Seuls les liens HTTP/HTTPS sont autorisés" }, { status: 400 });
  }

  if (isPrivateHost(parsed.hostname)) {
    return NextResponse.json({ error: "Hôte non autorisé" }, { status: 400 });
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FamilyFlowBot/1.0; +https://familyflow.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(7000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Impossible de récupérer cette page" }, { status: 422 });
    }

    const html = await response.text();
    const preview = extractMeta(html.slice(0, 120_000), parsed);

    return NextResponse.json({ preview });
  } catch {
    return NextResponse.json({ error: "Prévisualisation indisponible" }, { status: 422 });
  }
}
