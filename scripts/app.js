document.addEventListener('DOMContentLoaded', () => {
  const moreAdsBtn = document.querySelector('.btn-more-ads');
  
  if (moreAdsBtn) {
    moreAdsBtn.addEventListener('click', () => {
      console.log('[APP] User clicked Load More');
      showAdPlaceholders(true);
      const adsContainer = document.getElementById('ads-container');
      adsContainer.dataset.appendMode = 'true';
      window.api.sendMessage('fetch-more-ads', { action: 'click-load-more' });
    });
  }

  if (!window.api || typeof window.api.sendMessage !== 'function') {
    console.error('[CRITICAL] window.api.sendMessage is undefined');
    alert('Internal error: API bridge is missing. Please restart the app.');
    return;
  }

  console.log('[APP] Sending fetch-home-ads via sendMessage');
  showAdPlaceholders();
  window.api.sendMessage('fetch-home-ads');

  window.api.receive('home-ads-result', (ads) => {
    const adsContainer = document.getElementById('ads-container');
    adsContainer.dataset.appendMode = '';
    if (!ads || ads.error) {
      console.error('CRITICAL: Received null or undefined result');
      alert('Failed to scrape ads: ' + (ads?.message || 'Unknown error'));
      return;
    }
    console.log('[APP] Ads received:', ads);
    renderAds(ads);
  });

  window.api.receive('more-ads-result', (ads) => {
    const adsContainer = document.getElementById('ads-container');
    adsContainer.dataset.appendMode = 'true';
    if (!ads || ads.error) {
      console.error('Failed to fetch more ads:', ads);
      return;
    }
    console.log('[APP] More ads received:', ads);
    renderAds(ads, true); // True indicates we are appending
  });
});

function showAdPlaceholders(isAppending = false) {
  const adsContainer = document.getElementById('ads-container');
  
  if (!isAppending) {
    adsContainer.innerHTML = ''; // Clear all existing content (only initial load)
  } else {
    // Remove old placeholders before adding new ones
    document.querySelectorAll('.ad-card.skeleton').forEach(e => e.remove());
  }

  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'ad-card skeleton';
    skeleton.style.background = '#1c1c1e';
    skeleton.style.borderRadius = '14px';
    skeleton.style.margin = '16px';
    skeleton.style.color = '#fff';
    skeleton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    skeleton.style.display = 'flex';
    skeleton.style.flexDirection = 'column';
    skeleton.style.maxWidth = '300px';
    skeleton.style.minHeight = '420px';
    skeleton.style.position = 'relative';
    skeleton.style.overflow = 'hidden';

    skeleton.innerHTML = `
      <div style="height: 200px; background: linear-gradient(90deg, #2a2a2c 25%, #333 50%, #2a2a2c 75%); background-size: 400% 100%; animation: shimmer 1.5s infinite;"></div>
      <div style="flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="height: 16px; width: 80%; background: #3a3a3c; border-radius: 4px; margin-bottom: 10px;"></div>
          <div style="height: 14px; width: 50%; background: #3a3a3c; border-radius: 4px; margin-bottom: 6px;"></div>
          <div style="height: 14px; width: 60%; background: #3a3a3c; border-radius: 4px; margin-bottom: 16px;"></div>
        </div>
        <div style="height: 36px; width: 100%; background: #444; border-radius: 8px;"></div>
      </div>
    `;

    adsContainer.appendChild(skeleton);
  }
}

function renderAds(ads, isAppending = false) {
  const adsContainer = document.getElementById('ads-container');

  // Remove existing skeletons and ensure ads are appended correctly
  if (!isAppending) {
    adsContainer.innerHTML = ''; // Clear all content on initial load
  }

  if (ads.length === 0) {
    const noResultsMessage = document.createElement('div');
    noResultsMessage.textContent = 'Nema pronađenih oglasa.';
    noResultsMessage.style.textAlign = 'center';
    noResultsMessage.style.color = 'var(--text-secondary)';
    noResultsMessage.style.padding = '20px';
    adsContainer.appendChild(noResultsMessage);
    return;
  }

  ads.forEach(ad => {
    const card = document.createElement('div');
    card.className = 'ad-card';
    card.style.background = '#1c1c1e';
    card.style.borderRadius = '14px';
    card.style.overflow = 'hidden';
    card.style.margin = '16px';
    card.style.color = '#fff';
    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.maxWidth = '300px';
    card.style.minHeight = '420px';
    card.style.position = 'relative';

    const img = document.createElement('img');
    img.src = ad.imageUrl || 'placeholder.jpg';
    img.alt = ad.title;
    img.style.width = '100%';
    img.style.height = '200px';
    img.style.objectFit = 'cover';

    const content = document.createElement('div');
    content.style.flex = '1';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.padding = '16px';

    const title = document.createElement('h3');
    title.textContent = ad.title;
    title.style.margin = '0 0 10px 0';
    title.style.fontSize = '17px';
    title.style.fontWeight = '600';
    title.style.color = '#fff';

    const tags = document.createElement('div');
    tags.style.display = 'flex';
    tags.style.flexWrap = 'wrap';
    tags.style.gap = '6px';
    tags.style.marginBottom = Array.isArray(ad.tags) && ad.tags.length ? '10px' : '0';

    if (Array.isArray(ad.tags)) {
      ad.tags.forEach(tagText => {
        const tag = document.createElement('span');
        tag.textContent = tagText;
        tag.style.background = '#2a2a2c';
        tag.style.padding = '4px 10px';
        tag.style.borderRadius = '6px';
        tag.style.fontSize = '11px';
        tag.style.color = '#ddd';
        tags.appendChild(tag);
      });
    }

    const time = document.createElement('div');
    time.textContent = ad.time || 'prije jedne minute';
    time.style.fontSize = '12px';
    time.style.color = '#aaa';
    time.style.marginBottom = '6px';

    const price = document.createElement('div');
    price.textContent = ad.price;
    price.style.fontWeight = 'bold';
    price.style.fontSize = '17px';
    price.style.color = '#fefefe';
    price.style.marginBottom = '16px';

    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.padding = '0 16px 16px';

    const button = document.createElement('a');
    button.href = ad.link;
    button.target = '_blank';
    button.innerHTML = 'Pogledaj <img src="./assets/icons/arrow-right.svg" alt="arrow" style="width:14px;height:14px;margin-left:8px;vertical-align:middle;filter:brightness(0) invert(1);transition: transform 0.2s;" />';
    button.style.background = '#2D2D2D';
    button.style.color = '#fff';
    button.style.textAlign = 'center';
    button.style.padding = '10px 12px';
    button.style.borderRadius = '10px';
    button.style.fontWeight = '500';
    button.style.textDecoration = 'none';
    button.style.display = 'block';
    button.style.transition = 'all 0.2s ease';
    button.onmouseover = () => {
      const img = button.querySelector('img');
      if (img) img.style.transform = 'translateX(4px)';
    };
    button.onmouseout = () => {
      const img = button.querySelector('img');
      if (img) img.style.transform = 'translateX(0)';
    };

    buttonWrapper.appendChild(button);

    content.appendChild(title);
    if (tags.children.length > 0) content.appendChild(tags);
    content.appendChild(time);
    content.appendChild(price);

    card.appendChild(img);
    card.appendChild(content);
    card.appendChild(buttonWrapper);

    adsContainer.appendChild(card);
  });
}
