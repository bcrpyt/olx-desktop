const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const OLXScraper = require('./olx-scraper');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools({ mode: 'detach' });
}

ipcMain.handle('scrape-olx', async (event) => {
  console.log('Scraping process initiated in main process');
  try {
    const scraper = new OLXScraper();
    console.log('OLX Scraper instantiated');
    
    const result = await scraper.scrapeHomePage();
    console.log('Scraping completed, result:', result);
    
    return result;
  } catch (error) {
    console.error('CATASTROPHIC SCRAPING ERROR:', error);
    return { 
      error: true, 
      message: error.message,
      fullError: error
    };
  }
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