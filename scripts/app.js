// Verbose logging helper
function logToConsole(message, data = null) {
  console.log(`[OLX SCRAPER] ${message}`);
  if (data !== null) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Helper function to create a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    logToConsole('DOM Content Loaded. Waiting for page initialization...');
    
    // Deliberate delay to allow page to stabilize
    await delay(5000);  // 5-second delay
    
    logToConsole('Attempting to scrape OLX ads');
    const result = await window.electronAPI.sendMessage('scrape-olx');
    
    logToConsole('Raw scraping result:', result);
    
    const adsContainer = document.getElementById('ads-container');
    adsContainer.innerHTML = ''; // Clear existing content

    // Extended error checking
    if (result === null || result === undefined) {
      logToConsole('CRITICAL: Received null or undefined result');
      throw new Error('Scraping returned null or undefined result');
    }

    // Detailed error object handling
    if (result && result.error === true) {
      logToConsole('Explicit scraping error:', result);
      
      adsContainer.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 20px; background-color: #f8d7da; color: #721c24;">
          <h2>Scraping Failed</h2>
          <p><strong>Error Type:</strong> ${result.type || 'Unknown'}</p>
          <p><strong>Error Message:</strong> ${result.message || 'No details available'}</p>
          <pre style="white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(result, null, 2)}</pre>
        </div>
      `;
      return;
    }

    // Robust result parsing
    const ads = Array.isArray(result) ? result : 
               (result && result.data && Array.isArray(result.data) ? result.data : []);

    logToConsole(`Processed ads count: ${ads.length}`);

    if (ads.length === 0) {
      logToConsole('No ads found in the result');
      adsContainer.innerHTML = `
        <div class="no-ads-message" style="text-align: center; padding: 20px; background-color: #f8f9fa;">
          <h2>No Ads Found</h2>
          <p>Possible reasons:</p>
          <ul>
            <li>Website might have changed</li>
            <li>Scraping was blocked</li>
            <li>No ads available at the moment</li>
          </ul>
          <p>Raw result details:</p>
          <pre>${JSON.stringify(result, null, 2)}</pre>
        </div>
      `;
      return;
    }

    // Render ads
    ads.forEach((ad, index) => {
      try {
        const adElement = document.createElement('div');
        adElement.classList.add('ad-card');
        
        const title = ad.title || ad.name || `Untitled Ad #${index + 1}`;
        const price = ad.price || 'Price Not Available';
        const imageUrl = ad.imageUrl || ad.image || '';

        adElement.innerHTML = `
          <div class="ad-image" style="max-height: 200px; overflow: hidden;">
            ${imageUrl 
              ? `<img src="${imageUrl}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover;">` 
              : '<div class="no-image" style="background-color: #e9ecef; height: 200px; display: flex; justify-content: center; align-items: center;">No Image</div>'
            }
          </div>
          <div class="ad-content" style="padding: 15px;">
            <h3 style="margin-bottom: 10px; font-size: 16px;">${title}</h3>
            <div class="ad-meta" style="display: flex; justify-content: space-between; align-items: center;">
              <span class="ad-price" style="font-weight: bold; color: #007bff;">${price}</span>
              <small>${ad.source || 'Unknown source'}</small>
            </div>
          </div>
        `;

        adsContainer.appendChild(adElement);
      } catch (adError) {
        logToConsole(`Error rendering ad #${index}:`, adError);
      }
    });

  } catch (error) {
    logToConsole('Catastrophic scraping failure:', error);
    
    const adsContainer = document.getElementById('ads-container');
    adsContainer.innerHTML = `
      <div class="critical-error" style="text-align: center; padding: 20px; background-color: #f8d7da; color: #721c24;">
        <h2>Critical Error</h2>
        <p>Failed to scrape ads: ${error.message}</p>
        <p>Error Type: ${error.constructor.name}</p>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
});