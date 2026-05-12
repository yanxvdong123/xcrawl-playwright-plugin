# Playwright XCrawl Proxy Plugin

Playwright plugin for automatic proxy rotation via XCrawl.

## Install

```bash
npm install playwright-xcrawl-proxy
```

## Usage

```typescript
import { chromium } from 'playwright';
import { XCrawlProxyPlugin } from 'playwright-xcrawl-proxy';

const plugin = new XCrawlProxyPlugin({
  apiKey: process.env.XCRAWL_API_KEY!,
  country: 'US',          // optional: preferred proxy country
});

const browser = await chromium.launch();

// Create a context with proxy
const context = await plugin.createContext(browser);
const page = await context.newPage();
await page.goto('https://example.com');

// Rotate proxy for next request
const newContext = await plugin.rotateProxy(browser);

await browser.close();
```

## API

| Method | Description |
|--------|-------------|
| `getProxy()` | Get a new proxy address from XCrawl |
| `createContext(browser)` | Create Playwright context with proxy |
| `rotateProxy(browser)` | Get new proxy, return new context |

## Publish to npm

```bash
npm run build
npm publish
```
