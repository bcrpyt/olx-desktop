const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const OLXScraper = require('./olx-scraper');

// Enable more verbose logging
require('electron-debug')({ showDevTools: true });

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
  
  // Always open DevTools for debugging
  mainWindow.webContents.openDevTools({ mode: 'detach' });
}

// Detailed logging for scraping process
ipcMain.handle('scrape-olx', async (event) => {
  console.log('===== SCRAPING PROCESS STARTED =====');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    console.log('Instantiating OLX Scraper...');
    const scraper = new OLXScraper();
    
    console.log('Initiating scrapeHomePage() method...');
    const result = await scraper.scrapeHomePage();
    
    console.log('===== SCRAPING RESULT =====');
    console.log('Result type:', typeof result);
    console.log('Result keys:', result ? Object.keys(result) : 'No keys (null/undefined)');
    console.log('Detailed result:', JSON.stringify(result, null, 2));

    // Ensure we always return a consistent response
    if (!result) {
      console.error('CRITICAL: No result returned from scraper');
      return { 
        error: true, 
        message: 'No result returned from scraper',
        type: 'EmptyResult'
      };
    }

    return result;
  } catch (error) {
    console.error('===== CATASTROPHIC SCRAPING ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return { 
      error: true, 
      message: error.message || 'Unknown scraping error',
      type: error.constructor.name,
      stack: error.stack
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