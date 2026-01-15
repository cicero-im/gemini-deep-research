/**
 * Citation Resolution API Route
 *
 * POST: Resolves Google grounding API redirect URLs to actual URLs
 * and fetches page metadata (title, description, favicon).
 *
 * Request body:
 * - url: string - The grounding URL to resolve
 *
 * Response:
 * - resolvedUrl: string - The actual destination URL
 * - title: string - Page title
 * - description: string - Page description (truncated)
 * - favicon: string - Favicon URL
 * - domain: string - Domain name
 */

import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// TYPES
// =============================================================================

interface ResolveRequestBody {
  url: string;
}

interface CitationMetadata {
  resolvedUrl: string;
  title: string;
  description: string;
  favicon: string;
  domain: string;
}

// In-memory cache for resolved URLs (persists across requests in same server instance)
const urlCache = new Map<string, CitationMetadata>();

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Resolves a grounding API redirect URL to the actual destination
 */
async function resolveRedirectUrl(url: string): Promise<string> {
  try {
    // Follow redirects manually to get the final URL
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // The final URL after all redirects
    return response.url;
  } catch (error) {
    console.error("Failed to resolve redirect:", error);
    // Return original URL if resolution fails
    return url;
  }
}

/**
 * Fetches page metadata (title, description, favicon)
 */
async function fetchPageMetadata(
  url: string
): Promise<Omit<CitationMetadata, "resolvedUrl">> {
  const domain = new URL(url).hostname;
  const defaultMeta = {
    title: domain,
    description: "",
    favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    domain,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return defaultMeta;
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
    );
    const title =
      ogTitleMatch?.[1] || titleMatch?.[1]?.trim() || domain;

    // Extract description
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    );
    const ogDescMatch = html.match(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
    );
    let description = ogDescMatch?.[1] || descMatch?.[1] || "";

    // Truncate description to ~150 chars
    if (description.length > 150) {
      description = description.slice(0, 147) + "...";
    }

    // Extract favicon
    const faviconMatch = html.match(
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i
    );
    let favicon = defaultMeta.favicon;
    if (faviconMatch?.[1]) {
      const faviconUrl = faviconMatch[1];
      if (faviconUrl.startsWith("http")) {
        favicon = faviconUrl;
      } else if (faviconUrl.startsWith("//")) {
        favicon = `https:${faviconUrl}`;
      } else if (faviconUrl.startsWith("/")) {
        favicon = `https://${domain}${faviconUrl}`;
      }
    }

    return {
      title: decodeHtmlEntities(title),
      description: decodeHtmlEntities(description),
      favicon,
      domain,
    };
  } catch (error) {
    console.error("Failed to fetch page metadata:", error);
    return defaultMeta;
  }
}

/**
 * Decodes HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/resolve-citation
 *
 * Resolves a grounding URL and fetches page metadata
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResolveRequestBody;

    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const url = body.url.trim();

    // Check cache first
    const cached = urlCache.get(url);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Resolve the redirect URL
    const resolvedUrl = await resolveRedirectUrl(url);

    // Fetch page metadata
    const metadata = await fetchPageMetadata(resolvedUrl);

    const result: CitationMetadata = {
      resolvedUrl,
      ...metadata,
    };

    // Cache the result
    urlCache.set(url, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Citation resolution error:", error);

    return NextResponse.json(
      {
        error: "Failed to resolve citation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resolve-citation/batch
 *
 * Resolves multiple URLs in parallel
 */
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { urls: string[] };

    if (!body.urls || !Array.isArray(body.urls)) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 }
      );
    }

    // Limit batch size
    const urls = body.urls.slice(0, 50);

    // Resolve all URLs in parallel
    const results = await Promise.all(
      urls.map(async (url) => {
        // Check cache first
        const cached = urlCache.get(url);
        if (cached) {
          return { url, ...cached };
        }

        try {
          const resolvedUrl = await resolveRedirectUrl(url);
          const metadata = await fetchPageMetadata(resolvedUrl);

          const result: CitationMetadata = {
            resolvedUrl,
            ...metadata,
          };

          // Cache the result
          urlCache.set(url, result);

          return { url, ...result };
        } catch (error) {
          return {
            url,
            resolvedUrl: url,
            title: new URL(url).hostname,
            description: "",
            favicon: "",
            domain: new URL(url).hostname,
            error: true,
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Batch citation resolution error:", error);

    return NextResponse.json(
      {
        error: "Failed to resolve citations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
