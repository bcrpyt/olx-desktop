// app.js - Main application script

// Sample data for demonstration
const sampleAds = [
  {
    id: 1,
    title: 'Volkswagen Golf 7 1.6 TDI DSG Facelift 2017',
    price: '27.900',
    status: 'Polovno',
    image: 'assets/images/sample-ad1.jpg',
    tags: ['dizel', '138.000 km', '2017'],
    time: 'prije 2 minute'
  },
  {
    id: 2,
    title: 'Stan na dan - Lukavica, Istočno Sarajevo',
    price: '50',
    status: 'Novo',
    image: 'assets/images/sample-ad2.jpg',
    tags: [],
    time: 'prije 3 minute'
  },
  {
    id: 3,
    title: 'BATTERY CREATINE, 250g KREATIN',
    price: '43',
    status: 'Novo',
    image: 'assets/images/sample-ad3.jpg',
    tags: [],
    time: 'prije par sekundi'
  },
  {
    id: 4,
    title: 'Česma baterija multifunkcionalni sudoper antracit boja',
    price: '350',
    status: 'Novo',
    image: 'assets/images/sample-ad4.jpg',
    tags: [],
    time: 'prije par sekundi'
  },
  {
    id: 5,
    title: 'BMW X5 M50',
    price: '59.000',
    status: 'Polovno',
    image: 'assets/images/sample-ad5.jpg',
    tags: ['dizel', '300.000 km', '2016'],
    time: 'prije 4 minute'
  },
  {
    id: 6,
    title: 'Solarne elektrane - rezervno napajanje 40 kW',
    price: '15.950',
    originalPrice: '17.725',
    status: 'Novo',
    image: 'assets/images/sample-ad6.jpg',
    tags: [],
    time: 'prije 5 minuta'
  },
  {
    id: 7,
    title: 'Opel Vivaro TURBO trozonska klima 92kw MOŽE ZAMJENA',
    price: '29.999',
    status: 'Polovno',
    image: 'assets/images/sample-ad7.jpg',
    tags: ['dizel', '21.000 km', '2017'],
    time: 'prije 1 sat'
  },
  {
    id: 8,
    title: 'Dvosoban stan sa terasom / Lukavica / Istočno Sarajevo',
    price: '180.000',
    status: 'Polovno',
    image: 'assets/images/sample-ad8.jpg',
    tags: ['61 m²', 'dvosoban (2)'],
    time: 'prije 5 minuta'
  }
];

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const adsContainer = document.getElementById('ads-container');
const btnMoreAds = document.querySelector('.btn-more-ads');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  renderAds(sampleAds);
  setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
  // Search functionality
  searchBtn.addEventListener('click', () => {
    handleSearch();
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  
  // More ads button
  btnMoreAds.addEventListener('click', () => {
    // In a real app, this would load more ads from a backend
    alert('U pravoj aplikaciji, ovdje bismo učitali više oglasa.');
  });
  
  // Category items
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      const categoryName = item.querySelector('.category-label').textContent;
      alert(`Kategorija: ${categoryName}`);
    });
  });
}

// Handle search
function handleSearch() {
  const query = searchInput.value.trim();
  if (query.length === 0) return;
  
  // In an Electron app with IPC, you would send this to the main process
  console.log('Searching for:', query);
  
  // Using the window.api that's exposed in preload.js
  if (window.api) {
    window.api.send('search-query', query);
    
    // Listen for response
    window.api.receive('search-results', (data) => {
      console.log('Search results:', data);
      // Process results
    });
  } else {
    // For browser testing when window.api isn't available
    alert(`Pretraživanje za: ${query}`);
  }
}

// Render ads to the container
function renderAds(ads) {
  adsContainer.innerHTML = '';
  
  ads.forEach(ad => {
    const adCard = createAdCard(ad);
    adsContainer.appendChild(adCard);
  });
}

// Create an ad card element
function createAdCard(ad) {
  const card = document.createElement('div');
  card.className = 'ad-card';
  card.dataset.id = ad.id;
  
  // Create image
  const img = document.createElement('img');
  img.className = 'ad-image';
  img.src = ad.image || 'assets/images/placeholder.jpg';
  img.alt = ad.title;
  card.appendChild(img);
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'ad-content';
  
  // Add title
  const title = document.createElement('h3');
  title.className = 'ad-title';
  title.textContent = ad.title;
  content.appendChild(title);
  
  // Add meta information
  const meta = document.createElement('div');
  meta.className = 'ad-meta';
  
  const price = document.createElement('div');
  price.className = 'ad-price';
  
  if (ad.originalPrice) {
    const originalPriceSpan = document.createElement('span');
    originalPriceSpan.style.textDecoration = 'line-through';
    originalPriceSpan.style.fontSize = '14px';
    originalPriceSpan.style.color = 'var(--text-tertiary)';
    originalPriceSpan.style.marginRight = '8px';
    originalPriceSpan.textContent = `${ad.originalPrice} KM`;
    price.appendChild(originalPriceSpan);
  }
  
  const currentPrice = document.createElement('span');
  currentPrice.textContent = `${ad.price} KM`;
  price.appendChild(currentPrice);
  meta.appendChild(price);
  
  if (ad.status) {
    const status = document.createElement('span');
    status.className = 'ad-status';
    status.textContent = ad.status;
    meta.appendChild(status);
  }
  
  content.appendChild(meta);
  
  // Add tags if available
  if (ad.tags && ad.tags.length > 0) {
    const details = document.createElement('div');
    details.className = 'ad-details';
    
    ad.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'ad-tag';
      tagEl.textContent = tag;
      details.appendChild(tagEl);
    });
    
    content.appendChild(details);
  }
  
  // Add time
  const time = document.createElement('div');
  time.className = 'ad-time';
  time.textContent = ad.time;
  content.appendChild(time);
  
  card.appendChild(content);
  
  // Add click event
  card.addEventListener('click', () => {
    alert(`Oglas: ${ad.title}`);
  });
  
  return card;
}

// Function to toggle darkmode (for future implementation)
function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
}