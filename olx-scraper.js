const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

class OLXScraper {
  constructor() {
    this.baseUrl = 'https://olx.ba/';
    console.log(`OLXScraper initialized with base URL: ${this.baseUrl}`);
  }

  async scrapeHomePage() {
    console.log('===== SCRAPING HOME PAGE STARTED =====');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    let browser = null;
    let page = null;

    try {
      console.log('Launching browser...');
      browser = await puppeteer.launch({
        headless: false,  // Keep visible for debugging
        devtools: true,   // Open DevTools
        defaultViewport: null,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--window-size=1920,1080'
        ]
      });

      console.log('Creating new page...');
      page = await browser.newPage();

      // Set up logging for page events
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('pageerror', err => console.log('PAGE ERROR:', err));
      page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url()));

      console.log('Setting user agent and headers...');
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      });

      console.log('Enabling request interception...');
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        const blockedTypes = ['image', 'media', 'font', 'stylesheet'];
        if (blockedTypes.includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      console.log(`Navigating to: ${this.baseUrl}`);
      const response = await page.goto(this.baseUrl, {
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
        timeout: 90000  // 90 seconds timeout
      });

      console.log('Response status:', response ? response.status() : 'No response');
      
      if (!response || response.status() !== 200) {
        throw new Error(`Failed to load page. Status: ${response ? response.status() : 'Unknown'}`);
      }

      console.log('Waiting for page to stabilize...');
      await page.waitForFunction(() => {
        const adContainers = document.querySelectorAll('.ad-card, [data-v-3561702f], .listing-card');
        console.log(`Found ${adContainers.length} ad containers`);
        return adContainers.length > 0;
      }, { 
        timeout: 30000,
        polling: 'mutation'
      });

      console.log('Scrolling to trigger lazy loading...');
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      await page.waitForTimeout(3000);  // Wait for content to load

      console.log('Extracting ads...');
      const ads = await page.evaluate(() => {
        const adSelectors = [
          '.ad-card', 
          '[data-v-3561702f]', 
          '.listing-card',
          '.product-item',
          '[class*="listing"]',
          '[class*="card"]'
        ];

        const foundAds = [];

        adSelectors.forEach(selector => {
          const items = document.querySelectorAll(selector);
          console.log(`Selector ${selector} found ${items.length} items`);
          
          items.forEach((item, index) => {
            try {
              const titleEl = item.querySelector('.main-heading, h1, .title');
              const priceEl = item.querySelector('.smaller, .price, [class*="price"]');
              const imageEl = item.querySelector('img');

              if (titleEl && priceEl) {
                foundAds.push({
                  id: `${selector}_${index}`,
                  title: titleEl.textContent.trim(),
                  price: priceEl.textContent.trim(),
                  imageUrl: imageEl ? imageEl.src : '',
                  source: selector
                });
              }
            } catch (itemError) {
              console.error(`Error processing item in ${selector}:`, itemError);
            }
          });
        });

        console.log(`Total ads found: ${foundAds.length}`);
        return foundAds;
      });

      console.log('===== SCRAPING COMPLETED =====');
      console.log(`Scraped ${ads.length} ads`);
      
      if (ads.length === 0) {
        console.error('No ads found on the page');
        return {
          error: true,
          message: 'No ads found on the page',
          type: 'NoAdsFound'
        };
      }

      return ads;

    } catch (error) {
      console.error('===== SCRAPING ERROR =====');
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      return { 
        error: true, 
        message: error.message || 'Unknown scraping error',
        type: error.constructor.name,
        stack: error.stack
      };
    } finally {
      if (browser) {
        console.log('Closing browser...');
        await browser.close();
      }
    }
  }
}

module.exports = OLXScraper;