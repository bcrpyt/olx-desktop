document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Attempting to scrape OLX ads');
    const result = await window.electronAPI.sendMessage('scrape-olx');
    
    console.log('Raw scraping result:', result);
    
    const adsContainer = document.getElementById('ads-container');
    adsContainer.innerHTML = ''; // Clear existing content

    // Handle different possible return types
    if (result.error) {
      console.error('Scraping error:', result);
      adsContainer.innerHTML = `
        <div class="error-message">
          <h2>Scraping Failed</h2>
          <p>${result.message || 'Unknown error occurred'}</p>
          ${result.details ? `<pre>${JSON.stringify(result.details, null, 2)}</pre>` : ''}
        </div>
      `;
      return;
    }

    // Ensure result is an array
    const ads = Array.isArray(result) ? result : [];

    if (ads.length === 0) {
      adsContainer.innerHTML = `
        <div class="no-ads-message">
          <h2>No Ads Found</h2>
          <p>The website might have changed or blocked scraping.</p>
        </div>
      `;
      return;
    }

    // Render ads
    ads.forEach(ad => {
      const adElement = document.createElement('div');
      adElement.classList.add('ad-card');
      
      adElement.innerHTML = `
        <div class="ad-image">
          ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}">` : '<div class="no-image">No Image</div>'}
        </div>
        <div class="ad-content">
          <h3 class="ad-title">${ad.title || 'Untitled Ad'}</h3>
          <div class="ad-meta">
            <span class="ad-price">${ad.price || 'Price Not Available'}</span>
          </div>
        </div>
      `;

      adsContainer.appendChild(adElement);
    });
  } catch (error) {
    console.error('Catastrophic scraping failure:', error);
    const adsContainer = document.getElementById('ads-container');
    adsContainer.innerHTML = `
      <div class="critical-error">
        <h2>Critical Error</h2>
        <p>Failed to scrape ads: ${error.message}</p>
      </div>
    `;
  }
});