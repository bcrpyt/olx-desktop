const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const OLXScraper = require('./olx-scraper');

let currentPage = 1;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle initial scrape
ipcMain.on('fetch-home-ads', async (event) => {
  try {
    currentPage = 1;
    const scraper = new OLXScraper();
    const ads = await scraper.scrapeHomePage({ page: currentPage });
    event.reply('home-ads-result', ads);
  } catch (error) {
    event.reply('home-ads-result', { error: true, message: error.message });
  }
});

// Handle Load More
ipcMain.on('fetch-more-ads', async (event) => {
  try {
    currentPage++;
    const scraper = new OLXScraper();
    const ads = await scraper.scrapeHomePage({ page: currentPage });
    event.reply('more-ads-result', ads);
  } catch (error) {
    event.reply('more-ads-result', { error: true, message: error.message });
  }
});
