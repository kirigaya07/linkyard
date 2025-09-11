// app/api/scrape/route.ts
import { NextRequest } from "next/server";
import { JSDOM } from "jsdom";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return Response.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      redirect: "follow",
      // helps some sites return correct OG/Twitter tags
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const html = await res.text();

    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    const pick = (sel: string, attr = "content") =>
      doc.querySelector(sel)?.getAttribute(attr) || undefined;

    const domain = new URL(url).hostname.replace(/^www\./, "");
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    const title =
      pick('meta[property="og:title"]') ||
      pick('meta[name="twitter:title"]') ||
      doc.title ||
      domain;

    const description =
      pick('meta[property="og:description"]') ||
      pick('meta[name="twitter:description"]') ||
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
      undefined;

    // prefer OG image, fall back to twitter image
    let image =
      pick('meta[property="og:image:secure_url"]') ||
      pick('meta[property="og:image"]') ||
      pick('meta[name="twitter:image"]') ||
      undefined;

    // resolve relative -> absolute
    if (image && image.startsWith("/")) {
      image = new URL(image, url).toString();
    }

    return Response.json({
      url,
      domain,
      title: title?.trim() || domain,
      description: description?.trim(),
      imageUrl: image || favicon, // fallback to favicon
    });
  } catch {
    const domain = (() => {
      try {
        return new URL(url!).hostname.replace(/^www\./, "");
      } catch {
        return url;
      }
    })();
    return Response.json({
      url,
      domain,
      title: domain,
      description: undefined,
      imageUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    });
  }
}
