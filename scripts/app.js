document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Request scraping from main process
    const ads = await window.electronAPI.sendMessage('scrape-olx');
    
    // Render ads
    const adsContainer = document.getElementById('ads-container');
    adsContainer.innerHTML = ''; // Clear existing content

    ads.forEach(ad => {
      const adElement = document.createElement('div');
      adElement.classList.add('ad-item');
      
      adElement.innerHTML = `
        <h3>${ad.title}</h3>
        <p>Price: ${ad.price}</p>
        ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}">` : ''}
      `;

      adsContainer.appendChild(adElement);
    });
  } catch (error) {
    console.error('Failed to scrape ads:', error);
  }
});