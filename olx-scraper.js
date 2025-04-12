const puppeteer = require('puppeteer');

class OLXScraper {
  constructor() {
    this.baseUrl = 'https://www.olx.ba';
  }

  async scrapeHomePage() {
    let browser = null;
    try {
      console.log('Starting browser launch...');
      
      // Verbose logging of browser creation
      browser = await puppeteer.launch({
        headless: false, // Keep browser visible for debugging
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials'
        ],
        defaultViewport: null // Use full browser window
      });

      console.log('Browser launched successfully');

      const page = await browser.newPage();
      
      // Set very aggressive user agent and additional headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
      });

      console.log(`Navigating to: ${this.baseUrl}`);
      
      // Extensive navigation and page load logging
      page.on('console', msg => console.log('Browser Console:', msg.text()));
      page.on('pageerror', err => console.error('Page Error:', err));
      page.on('requestfailed', req => console.log('Failed Request:', req.url()));

      // Navigate with extended timeout and multiple wait conditions
      await page.goto(this.baseUrl, {
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
        timeout: 90000 // 90 seconds timeout
      });

      console.log('Page loaded, checking content');

      // Take a full-page screenshot for debugging
      await page.screenshot({ 
        path: 'debug-full-page.png', 
        fullPage: true 
      });

      // Evaluate page to get full HTML for debugging
      const pageContent = await page.content();
      console.log('Page Content Length:', pageContent.length);
      
      // More aggressive and flexible ad finding
      const ads = await page.evaluate(() => {
        console.log('Starting ad evaluation in browser context');
        
        // Multiple selector strategies
        const adSelectors = [
          '.oglas-item', 
          '.product-item', 
          '[class*="oglas"]', 
          '[class*="product"]',
          '.ad-card',
          '.listing-item'
        ];

        const foundAds = [];

        // Try each selector
        adSelectors.forEach(selector => {
          const items = document.querySelectorAll(selector);
          console.log(`Selector "${selector}" found ${items.length} items`);

          items.forEach((item, index) => {
            // More flexible element finding
            const titleEl = 
              item.querySelector('.title') || 
              item.querySelector('.naslov') || 
              item.querySelector('[class*="title"]') || 
              item.querySelector('[class*="naslov"]') || 
              item;

            const priceEl = 
              item.querySelector('.price') || 
              item.querySelector('.cijena') || 
              item.querySelector('[class*="price"]') || 
              item.querySelector('[class*="cijena"]');

            const imageEl = item.querySelector('img');

            foundAds.push({
              id: index + 1,
              title: titleEl ? titleEl.textContent.trim() : 'No Title',
              price: priceEl ? priceEl.textContent.trim() : 'Price Not Available',
              imageUrl: imageEl ? imageEl.src : ''
            });
          });
        });

        console.log(`Total ads found: ${foundAds.length}`);
        return foundAds;
      });

      console.log(`Scraped ${ads.length} ads`);
      return ads;
    } catch (error) {
      console.error('FULL Scraping Error:', error);
      return {
        error: true,
        message: error.message,
        stack: error.stack
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = OLXScraper;