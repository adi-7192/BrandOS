const BLOCKED_PATH_SEGMENTS = [
  '/privacy',
  '/terms',
  '/login',
  '/signin',
  '/account',
  '/cart',
  '/checkout',
  '/search',
  '/contact',
];

const PRIORITY_SEGMENTS = [
  '/about',
  '/products',
  '/product',
  '/services',
  '/service',
  '/collections',
  '/categories',
  '/blog',
  '/journal',
  '/news',
  '/press',
];

export function normalizeSeedUrls({ websiteUrl = '', websiteUrls = [] } = {}) {
  const raw = [
    websiteUrl,
    ...(Array.isArray(websiteUrls) ? websiteUrls : parseWebsiteUrlsInput(websiteUrls)),
  ];

  return [...new Set(raw
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).toString();
      } catch {
        return null;
      }
    })
    .filter(Boolean))];
}

export function parseWebsiteUrlsInput(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value).split(',').map((entry) => entry.trim()).filter(Boolean);
  }
}

export function parseSitemapUrls(xml) {
  return [...String(xml || '').matchAll(/<loc>(.*?)<\/loc>/gi)]
    .map((match) => decodeHtmlEntities(match[1].trim()))
    .filter(Boolean);
}

export async function crawlWebsiteSources({
  websiteUrl = '',
  websiteUrls = [],
  fetchImpl = fetch,
  maxPages = 8,
} = {}) {
  const seedUrls = normalizeSeedUrls({ websiteUrl, websiteUrls });
  if (seedUrls.length === 0) {
    return {
      seedUrls: [],
      pagesUsed: [],
      summary: '',
    };
  }

  const allowedHosts = new Set(seedUrls.map((value) => new URL(value).hostname));
  const candidates = new Set(seedUrls);

  for (const seed of seedUrls) {
    const sitemapUrl = new URL('/sitemap.xml', seed).toString();
    try {
      const sitemapRes = await fetchImpl(sitemapUrl, {
        headers: { 'User-Agent': 'BrandOSBot/1.0 (+https://brand-os-client.vercel.app)' },
      });
      if (!sitemapRes.ok) continue;
      const sitemapText = await sitemapRes.text();
      parseSitemapUrls(sitemapText)
        .filter((value) => isAllowedPage(value, allowedHosts))
        .forEach((value) => candidates.add(value));
    } catch {
      // ignore sitemap failures and continue with discovered links from seed pages
    }
  }

  const pages = [];
  for (const url of rankCandidateUrls([...candidates])) {
    if (pages.length >= maxPages) break;

    try {
      const res = await fetchImpl(url, {
        headers: { 'User-Agent': 'BrandOSBot/1.0 (+https://brand-os-client.vercel.app)' },
      });
      const contentType = res.headers?.get?.('content-type') || '';
      if (!res.ok || !contentType.includes('text/html')) continue;

      const html = await res.text();
      const text = extractVisibleText(html);
      if (!text) continue;

      pages.push({
        url,
        title: extractTitle(html),
        snippet: buildSnippet(text),
        score: scorePage(url, text),
      });

      if (pages.length < maxPages) {
        extractLinks(html, url)
          .filter((value) => isAllowedPage(value, allowedHosts))
          .forEach((value) => candidates.add(value));
      }
    } catch {
      // ignore unreachable pages
    }
  }

  const pagesUsed = [...pages]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPages);

  return {
    seedUrls,
    pagesUsed,
    summary: buildWebsiteSummary(pagesUsed),
  };
}

function buildWebsiteSummary(pages) {
  if (!pages.length) return '';

  const lines = pages.map((page) => {
    const title = page.title ? `${page.title} :: ` : '';
    return `- ${page.url} :: ${title}${page.snippet}`;
  });

  return `Website evidence summary:\n${lines.join('\n')}`;
}

function rankCandidateUrls(urls) {
  return [...new Set(urls)]
    .filter(Boolean)
    .sort((a, b) => scoreCandidateUrl(b) - scoreCandidateUrl(a));
}

function scoreCandidateUrl(url) {
  const lower = url.toLowerCase();
  let score = 0;
  for (const segment of PRIORITY_SEGMENTS) {
    if (lower.includes(segment)) score += 3;
  }
  if (new URL(url).pathname === '/' || new URL(url).pathname === '') score += 2;
  return score;
}

function scorePage(url, text) {
  return scoreCandidateUrl(url) + Math.min(Math.ceil(String(text).length / 220), 6);
}

function isAllowedPage(value, allowedHosts) {
  try {
    const url = new URL(value);
    if (!allowedHosts.has(url.hostname)) return false;
    const path = url.pathname.toLowerCase();
    return !BLOCKED_PATH_SEGMENTS.some((segment) => path.includes(segment));
  } catch {
    return false;
  }
}

function extractLinks(html, baseUrl) {
  return [...String(html || '').matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((match) => {
      try {
        return new URL(match[1], baseUrl).toString();
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function extractVisibleText(html) {
  return decodeHtmlEntities(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function extractTitle(html) {
  const match = String(html || '').match(/<title>(.*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

function buildSnippet(text, maxChars = 220) {
  return String(text || '').slice(0, maxChars).trim();
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
