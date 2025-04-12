const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

async function scrapeOLX() {
  try {
    const response = await axios.get('https://www.olx.ba');
    const $ = cheerio.load(response.data);
    const ads = [];

    $('.product-item').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const price = $(element).find('.price').text().trim();
      const imageUrl = $(element).find('img').attr('src');

      ads.push({
        id: index + 1,
        title,
        price,
        imageUrl: imageUrl ? `https://www.olx.ba${imageUrl}` : null
      });
    });

    return ads;
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}

ipcMain.handle('scrape-olx', async () => {
  return await scrapeOLX();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});