import test from 'node:test';
import assert from 'node:assert/strict';

import {
  crawlWebsiteSources,
  normalizeSeedUrls,
  parseSitemapUrls,
} from './websiteSource.js';

test('normalizeSeedUrls accepts a primary url plus optional extras and removes duplicates', () => {
  assert.deepEqual(
    normalizeSeedUrls({
      websiteUrl: 'https://example.com',
      websiteUrls: ['https://example.com/about', 'https://example.com', 'not-a-url'],
    }),
    ['https://example.com/', 'https://example.com/about']
  );
});

test('parseSitemapUrls extracts loc values from sitemap xml', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://example.com/</loc></url>
    <url><loc>https://example.com/about</loc></url>
  </urlset>`;

  assert.deepEqual(parseSitemapUrls(xml), [
    'https://example.com/',
    'https://example.com/about',
  ]);
});

test('crawlWebsiteSources builds a distilled website summary from relevant internal pages', async () => {
  const responses = new Map([
    ['https://example.com/sitemap.xml', response(200, 'application/xml', `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://example.com/</loc></url>
        <url><loc>https://example.com/about</loc></url>
        <url><loc>https://example.com/products/iphone</loc></url>
        <url><loc>https://example.com/privacy</loc></url>
      </urlset>`)],
    ['https://example.com/', response(200, 'text/html', `
      <html><head><title>Apple</title></head><body>
        <nav>Menu</nav>
        <main>Apple builds beautifully designed consumer products with a focus on privacy, performance, and integration.</main>
        <a href="/about">About</a>
      </body></html>
    `)],
    ['https://example.com/about', response(200, 'text/html', `
      <html><head><title>About Apple</title></head><body>
        <main>Apple creates premium devices and services for people who value simplicity, design, and ecosystem consistency.</main>
      </body></html>
    `)],
    ['https://example.com/products/iphone', response(200, 'text/html', `
      <html><head><title>iPhone</title></head><body>
        <main>iPhone delivers breakthrough camera systems, privacy features, and a seamless mobile experience.</main>
      </body></html>
    `)],
  ]);

  const result = await crawlWebsiteSources({
    websiteUrl: 'https://example.com',
    fetchImpl: async (url) => responses.get(url) || response(404, 'text/plain', 'Not found'),
    maxPages: 3,
  });

  assert.deepEqual(result.seedUrls, ['https://example.com/']);
  assert.deepEqual(result.pagesUsed.map((page) => page.url), [
    'https://example.com/products/iphone',
    'https://example.com/about',
    'https://example.com/',
  ]);
  assert.match(result.summary, /Website evidence summary:/);
  assert.match(result.summary, /iPhone/);
  assert.doesNotMatch(result.summary, /https:\/\/example\.com\/privacy/);
});

function response(status, contentType, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? contentType : null;
      },
    },
    async text() {
      return body;
    },
  };
}
