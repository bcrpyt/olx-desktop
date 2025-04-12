const { chromium } = require('playwright');

class OLXScraper {
  constructor() {
    this.baseUrl = 'https://olx.ba/';
  }

  async scrapeHomePage({ page = 1 } = {}) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const pageObj = await context.newPage();

    try {
      const targetUrl = `${this.baseUrl}?page=${page}`;
      console.log(`[OLX SCRAPER] Visiting: ${targetUrl}`);
      await pageObj.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      await pageObj.waitForSelector('.listing-card', { timeout: 15000 });

      const ads = await pageObj.$$eval('.listing-card', (cards) =>
        cards.map((card, index) => {
          const title = card.querySelector('h2, .main-heading')?.textContent?.trim();
          const price = card.querySelector('.price, .smaller')?.textContent?.trim();
          const imageUrl = card.querySelector('img')?.src || '';
          const tags = [...card.querySelectorAll('.tags span, .label, .chip')]
            .map((el) => el.textContent.trim())
            .filter(Boolean);
          const link = card.querySelector('a')?.href || '';
          return {
            id: `${title}_${index}_${Date.now()}`,
            title,
            price,
            imageUrl,
            tags,
            time: 'prije jedne minute',
            link
          };
        })
      );

      console.log(`[OLX SCRAPER] Returning ${ads.length} ads on page ${page}.`);
      return ads;

    } catch (err) {
      console.error('[OLX SCRAPER ERROR]', err);
      return {
        error: true,
        message: err.message,
        stack: err.stack,
      };
    } finally {
      await browser.close();
    }
  }
}

module.exports = OLXScraper;
