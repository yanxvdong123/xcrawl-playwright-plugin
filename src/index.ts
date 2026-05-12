/**
 * Playwright XCrawl Proxy Plugin
 * 
 * Automatically routes Playwright browser traffic through XCrawl's rotating proxies.
 * No more IP bans during testing or scraping.
 */

import { Browser, BrowserContext, Page } from 'playwright';
import axios from 'axios';

export interface XCrawlProxyConfig {
  apiKey: string;
  proxyUrl?: string;
  country?: string;
}

export interface ProxyInfo {
  host: string;
  port: number;
  username: string;
  password: string;
  country: string;
}

export class XCrawlProxyPlugin {
  private config: Required<XCrawlProxyConfig>;
  private currentProxy: ProxyInfo | null = null;

  constructor(config: XCrawlProxyConfig) {
    this.config = {
      apiKey: config.apiKey,
      proxyUrl: config.proxyUrl || 'https://api.xcrawl.com/v1',
      country: config.country || 'US',
    };
  }

  /**
   * Get a proxy address from XCrawl
   */
  async getProxy(): Promise<ProxyInfo> {
    try {
      const response = await axios.post(
        `${this.config.proxyUrl}/proxy`,
        { country: this.config.country },
        {
          headers: {
            'X-API-Key': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      this.currentProxy = response.data as ProxyInfo;
      return this.currentProxy;
    } catch (err) {
      throw new Error(`Failed to get proxy: ${err.message}`);
    }
  }

  /**
   * Get Playwright-compatible proxy config
   */
  async getPlaywrightProxy() {
    const proxy = await this.getProxy();
    return {
      server: `http://${proxy.host}:${proxy.port}`,
      username: proxy.username,
      password: proxy.password,
    };
  }

  /**
   * Create a new browser context with XCrawl proxy
   */
  async createContext(browser: Browser): Promise<BrowserContext> {
    const proxyConfig = await this.getPlaywrightProxy();
    return await browser.newContext({
      proxy: proxyConfig,
    });
  }

  /**
   * Rotate proxy for a page (navigate through new context)
   */
  async rotateProxy(browser: Browser): Promise<BrowserContext> {
    console.log('🔄 Rotating proxy...');
    this.currentProxy = null;
    return await this.createContext(browser);
  }
}

// === Usage Example ===
/*
import { chromium } from 'playwright';
import { XCrawlProxyPlugin } from 'playwright-xcrawl-proxy';

async function main() {
  const plugin = new XCrawlProxyPlugin({
    apiKey: process.env.XCRAWL_API_KEY!,
    country: 'US',
  });

  const browser = await chromium.launch({ headless: true });

  // Context with proxy
  const context = await plugin.createContext(browser);
  const page = await context.newPage();
  await page.goto('https://httpbin.org/ip');
  console.log(await page.textContent('body'));

  // Rotate proxy
  const newContext = await plugin.rotateProxy(browser);
  const newPage = await newContext.newPage();
  await newPage.goto('https://httpbin.org/ip');

  await browser.close();
}
*/
