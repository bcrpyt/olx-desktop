const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');

class OLXScraper {
  constructor() {
    this.baseUrl = 'https://www.olx.ba';
    
    // Configure Puppeteer with stealth plugin to bypass detection
    puppeteer.use(StealthPlugin());
  }

  async initBrowser() {
    return await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      executablePath: executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // This can help in some environments
        '--disable-gpu'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });
  }

  async scrapeWithDynamicRendering(url) {
    let browser;
    try {
      // Initialize browser
      browser = await this.initBrowser();
      
      // Create a new page
      const page = await browser.newPage();
      
      // Set realistic browser and user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Additional evasion techniques
      await page.evaluateOnNewDocument(() => {
        // Overwrite webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        });
        
        // Modify navigator properties
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5]
        });
      });
      
      // Block unnecessary resources to speed up scraping
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        const blockedTypes = ['image', 'stylesheet', 'font'];
        
        if (blockedTypes.includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });
      
      // Navigate to the page
      await page.goto(url, {
        waitUntil: 'networkidle0', // Wait until network is idle
        timeout: 60000 // 60 seconds timeout
      });
      
      // Wait for content to load
      await page.waitForSelector('.product-item, .oglas-item', {
        timeout: 30000
      });
      
      // Extract data using page.evaluate for dynamic content
      const ads = await page.evaluate(() => {
        const items = document.querySelectorAll('.product-item, .oglas-item');
        return Array.from(items).map((item, index) => {
          const titleEl = item.querySelector('.title, .product-title');
          const priceEl = item.querySelector('.price, .product-price');
          const imageEl = item.querySelector('img');
          const linkEl = item.querySelector('a');
          
          return {
            id: index + 1,
            title: titleEl ? titleEl.textContent.trim() : 'No Title',
            price: priceEl ? priceEl.textContent.trim() : 'Price Not Available',
            imageUrl: imageEl ? imageEl.src : '',
            link: linkEl ? linkEl.href : ''
          };
        });
      });
      
      return ads;
    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    } finally {
      // Always close the browser
      if (browser) await browser.close();
    }
  }

  async fetchHomePageAds() {
    try {
      // Use dynamic rendering to bypass JavaScript and detection
      const ads = await this.scrapeWithDynamicRendering(this.baseUrl);
      
      console.log('Scraped Ads:', ads);
      return ads;
    } catch (error) {
      console.error('Error fetching home page ads:', error);
      return [];
    }
  }

  async searchAds(query) {
    const searchUrl = `${this.baseUrl}/pretraga?q=${encodeURIComponent(query)}`;
    
    try {
      // Reuse the dynamic rendering method for search results
      const ads = await this.scrapeWithDynamicRendering(searchUrl);
      
      console.log('Search Results:', ads);
      return ads;
    } catch (error) {
      console.error('Error searching ads:', error);
      return [];
    }
  }
}

module.exports = OLXScraper;