// =============================================================================
// NAIJA BITES - INTEGRATED CUSTOMER APP SCRIPT
// Backend-driven Nigerian food delivery platform
// =============================================================================

// Global Variables
let products = [];
let cart = [];
let selectedLocation = '';
let currentLocationData = null;
let isDeliveryMode = false;
let deliveryFee = 1500;
let freeDeliveryThreshold = 15000; // Updated for Nigerian food business
let currentPage = 1;
let itemsPerPage = 12;
let isLoading = false;
let syncInterval;
let lastSyncTime = null;

// Backend-driven data
let allLocations = [];
let allCategories = [];
let activeDeals = {
    daily: [],
    flash: [],
    combo: []
};

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-backend-url.com'; // Replace with your actual backend URL

const API_ENDPOINTS = {
    locations: `${API_BASE_URL}/api/locations/active`,
    categories: `${API_BASE_URL}/api/categories/active`,
    products: `${API_BASE_URL}/api/products`,
    dailyDeals: `${API_BASE_URL}/api/deals/daily`,
    flashSales: `${API_BASE_URL}/api/deals/flash`,
    comboDeals: `${API_BASE_URL}/api/deals/combo`,
    notifications: `${API_BASE_URL}/api/notifications/subscribe`,
    orders: `${API_BASE_URL}/api/orders`
};

// Fallback data for development/offline mode
const fallbackLocations = [
    {
        id: 'ikeja',
        name: 'Ikeja Kitchen',
        address: '123 Ikeja Way, Lagos State',
        phone: '+2347062793809',
        hours: 'Mon-Sun: 9:00 AM - 11:00 PM',
        deliveryTime: '30-45 mins',
        deliveryFee: 500,
        isActive: true,
        manager: 'Adebayo Johnson'
    },
    {
        id: 'victoria-island',
        name: 'Victoria Island Kitchen',
        address: '456 Victoria Island, Lagos State',
        phone: '+2347062793809',
        hours: 'Mon-Sun: 9:00 AM - 11:00 PM',
        deliveryTime: '25-40 mins',
        deliveryFee: 700,
        isActive: true,
        manager: 'Funmi Adebayo'
    },
    {
        id: 'surulere',
        name: 'Surulere Kitchen',
        address: '789 Surulere Road, Lagos State',
        phone: '+2347062793809',
        hours: 'Mon-Sun: 9:00 AM - 11:00 PM',
        deliveryTime: '35-50 mins',
        deliveryFee: 600,
        isActive: true,
        manager: 'Kemi Okafor'
    },
    {
        id: 'lekki',
        name: 'Lekki Kitchen',
        address: '321 Lekki Phase 1, Lagos State',
        phone: '+2347062793809',
        hours: 'Mon-Sun: 9:00 AM - 11:00 PM',
        deliveryTime: '40-55 mins',
        deliveryFee: 800,
        isActive: false, // Example of inactive location
        manager: 'Tunde Bakare'
    },
    {
        id: 'ajah',
        name: 'Ajah Kitchen',
        address: '654 Ajah Express, Lagos State',
        phone: '+2347062793809',
        hours: 'Mon-Sun: 9:00 AM - 11:00 PM',
        deliveryTime: '45-60 mins',
        deliveryFee: 900,
        isActive: true,
        manager: 'Blessing Okoro'
    },
    {
        id: 'yaba',
        name: 'Yaba Kitchen',
        address: '987 Yaba College Road, Lagos State',
        phone: '+2347062793809',
        hours: 'Mon-Sun: 9:00 AM - 11:00 PM',
        deliveryTime: '30-45 mins',
        deliveryFee: 500,
        isActive: true,
        manager: 'Chidi Okonkwo'
    }
];

const fallbackCategories = [
    { id: 'rice-pasta', name: 'Rice & Pasta', slug: 'rice-pasta', isActive: true },
    { id: 'swallow', name: 'Swallow', slug: 'swallow', isActive: true },
    { id: 'soups', name: 'Soups', slug: 'soups', isActive: true },
    { id: 'side-dishes', name: 'Side Dishes', slug: 'side-dishes', isActive: true },
    { id: 'pastries', name: 'Pastries', slug: 'pastries', isActive: true },
    { id: 'cakes', name: 'Cakes', slug: 'cakes', isActive: true },
    { id: 'proteins', name: 'Proteins', slug: 'proteins', isActive: true },
    { id: 'others', name: 'Others', slug: 'others', isActive: true }
];

// Nigerian food sample products (fallback)
const fallbackProducts = [
    {
        id: 1,
        name: "Jollof Rice",
        category: "rice-pasta",
        price: 2500,
        unit: "plate",
        description: "Our signature Jollof rice cooked with aromatic spices and fresh tomatoes",
        image: "/images/jollof-rice.jpg",
        stock: { "ikeja": 25, "victoria-island": 20, "surulere": 30, "ajah": 15, "yaba": 35 },
        popularity: 98,
        prepTime: "20-25 mins",
        isSpicy: true,
        ingredients: ["Rice", "Tomatoes", "Onions", "Pepper", "Spices"]
    },
    {
        id: 2,
        name: "Egusi Soup",
        category: "soups",
        price: 3500,
        unit: "portion",
        description: "Traditional Egusi soup with assorted meat and fresh vegetables",
        image: "/images/egusi-soup.jpg",
        stock: { "ikeja": 15, "victoria-island": 10, "surulere": 20, "ajah": 12, "yaba": 18 },
        popularity: 95,
        prepTime: "30-35 mins",
        isSpicy: true,
        ingredients: ["Egusi", "Assorted Meat", "Stockfish", "Vegetables", "Palm Oil"]
    },
    {
        id: 3,
        name: "Pounded Yam",
        category: "swallow",
        price: 1800,
        unit: "portion",
        description: "Fresh pounded yam, perfectly smooth and stretchy",
        image: "/images/pounded-yam.jpg",
        stock: { "ikeja": 20, "victoria-island": 15, "surulere": 25, "ajah": 18, "yaba": 30 },
        popularity: 92,
        prepTime: "15-20 mins",
        isSpicy: false,
        ingredients: ["Fresh Yam"]
    },
    {
        id: 4,
        name: "Meat Pie",
        category: "pastries",
        price: 800,
        unit: "piece",
        description: "Crispy pastry filled with seasoned minced meat and vegetables",
        image: "/images/meat-pie.jpg",
        stock: { "ikeja": 40, "victoria-island": 35, "surulere": 30, "ajah": 45, "yaba": 38 },
        popularity: 88,
        prepTime: "5-10 mins",
        isSpicy: false,
        ingredients: ["Flour", "Minced Meat", "Potatoes", "Carrots", "Spices"]
    },
    {
        id: 5,
        name: "Pepper Soup",
        category: "others",
        price: 4000,
        unit: "bowl",
        description: "Spicy pepper soup with fresh fish and aromatic spices",
        image: "/images/pepper-soup.jpg",
        stock: { "ikeja": 12, "victoria-island": 8, "surulere": 15, "ajah": 10, "yaba": 20 },
        popularity: 85,
        prepTime: "25-30 mins",
        isSpicy: true,
        ingredients: ["Fresh Fish", "Pepper", "Ginger", "Garlic", "Local Spices"]
    },
    {
        id: 6,
        name: "Fried Plantain",
        category: "side-dishes",
        price: 1200,
        unit: "portion",
        description: "Sweet and perfectly fried ripe plantain slices",
        image: "/images/fried-plantain.jpg",
        stock: { "ikeja": 30, "victoria-island": 25, "surulere": 35, "ajah": 28, "yaba": 40 },
        popularity: 90,
        prepTime: "10-15 mins",
        isSpicy: false,
        ingredients: ["Ripe Plantain", "Palm Oil"]
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoadingOverlay();
    
    try {
        console.log('🚀 Initializing Naija Bites Customer App...');
        
        // Load initial data
        await loadInitialData();
        
        // Load user preferences and cart
        loadCartFromStorage();
        loadUserPreferences();
        
        // Setup event listeners
        initializeEventListeners();
        
        // Check for saved location
        await handleSavedLocation();
        
        // Load deals and start refresh intervals
        await loadDeals();
        setupRefreshIntervals();
        
        // Initialize UI
        updateCartDisplay();
        updateQuickCartCount();
        displayProducts();
        
        // Setup additional features
        setupMobileFeatures();
        setupNotifications();
        setupErrorHandling();
        
        // Track page load
        trackEvent('page_load', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        console.log('✅ Naija Bites Customer App Initialized Successfully');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showNotification('Failed to load app. Please refresh the page.', 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// =============================================================================
// BACKEND DATA LOADING
// =============================================================================

async function loadInitialData() {
    try {
        // Try to load from backend first, fallback to local data
        await Promise.all([
            loadLocations(),
            loadCategories()
        ]);
        
        console.log('📡 Backend data loaded successfully');
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using fallback data:', error);
        // Use fallback data
        allLocations = fallbackLocations.filter(loc => loc.isActive);
        allCategories = fallbackCategories.filter(cat => cat.isActive);
        
        updateLocationModal(allLocations);
        updateCategoryFilter(allCategories);
        updateFooterLocations(allLocations);
        updateActiveLocationsCount(allLocations.length);
    }
}

async function loadLocations() {
    try {
        const response = await fetch(API_ENDPOINTS.locations);
        if (!response.ok) throw new Error('Failed to fetch locations');
        
        const locations = await response.json();
        allLocations = locations.filter(location => location.isActive);
        
        updateLocationModal(allLocations);
        updateFooterLocations(allLocations);
        updateActiveLocationsCount(allLocations.length);
        
        console.log(`📍 Loaded ${allLocations.length} active locations`);
        
    } catch (error) {
        console.error('Error loading locations:', error);
        throw error;
    }
}

async function loadCategories() {
    try {
        const response = await fetch(API_ENDPOINTS.categories);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const categories = await response.json();
        allCategories = categories.filter(category => category.isActive);
        
        updateCategoryFilter(allCategories);
        
        console.log(`🏷️ Loaded ${allCategories.length} active categories`);
        
    } catch (error) {
        console.error('Error loading categories:', error);
        throw error;
    }
}

async function loadLocationProducts(locationId) {
    if (!locationId) return;
    
    try {
        document.getElementById('syncIndicator').style.display = 'flex';
        
        const response = await fetch(`${API_ENDPOINTS.products}?location=${locationId}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products_data = await response.json();
        products = products_data.map(product => ({
            ...product,
            popularity: product.popularity || Math.floor(Math.random() * 100)
        }));
        
        displayProducts();
        updateProductsStats();
        
        document.getElementById('locationStatus').textContent = 
            `Showing menu for ${currentLocationData.name}`;
        
        console.log(`🍽️ Loaded ${products.length} products for ${currentLocationData.name}`);
        
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data filtered by location
        products = fallbackProducts.filter(product => 
            product.stock[locationId] && product.stock[locationId] > 0
        );
        displayProducts();
        updateProductsStats();
        showNotification('Using sample menu data', 'warning');
    } finally {
        document.getElementById('syncIndicator').style.display = 'none';
    }
}

// =============================================================================
// LOCATION MANAGEMENT
// =============================================================================

function updateLocationModal(locations) {
    const locationOptions = document.getElementById('locationOptions');
    const locationLoading = document.getElementById('locationLoading');
    
    if (locationLoading) locationLoading.style.display = 'none';
    
    if (locationOptions) {
        locationOptions.innerHTML = locations.map(location => `
            <div class="location-option ${!location.isActive ? 'inactive' : ''}" 
                 data-location-id="${location.id}"
                 onclick="handleLocationSelection('${location.id}')">
                <div class="location-info">
                    <h4><i class="fas fa-store"></i> ${location.name}</h4>
                    <p>${location.address}</p>
                    <span class="status ${location.isActive ? 'active' : 'inactive'}">
                        <i class="fas fa-circle"></i> 
                        ${location.isActive ? 'Available' : 'Temporarily Closed'}
                    </span>
                </div>
                <div class="location-features">
                    <span><i class="fas fa-clock"></i> ${location.deliveryTime}</span>
                    <span><i class="fas fa-motorcycle"></i> ₦${location.deliveryFee} delivery</span>
                </div>
            </div>
        `).join('');
    }
}

async function handleLocationSelection(locationId) {
    const location = allLocations.find(loc => loc.id === locationId);
    
    if (!location || !location.isActive) {
        showNotification('This kitchen is temporarily closed', 'warning');
        return;
    }
    
    await selectLocation(location);
    hideLocationModal();
}

async function selectLocation(location) {
    currentLocationData = location;
    selectedLocation = location.id;
    
    // Update delivery fee based on location
    deliveryFee = location.deliveryFee || 1500;
    
    // Save to localStorage
    localStorage.setItem('naijabites_selected_location', location.id);
    localStorage.setItem('naijabites_location_data', JSON.stringify(location));
    
    // Update UI
    document.getElementById('selectedLocation').textContent = location.name.replace(' Kitchen', '');
    
    // Load location-specific data
    await Promise.all([
        loadLocationProducts(location.id),
        loadLocationDeals(location.id)
    ]);
    
    updateStoreStatus(location);
    updateDeliveryInfo();
    updateCartSummary();
    
    showNotification(`Switched to ${location.name}`, 'success');
    
    // Track location selection
    trackEvent('location_selected', {
        locationId: location.id,
        locationName: location.name,
        timestamp: new Date().toISOString()
    });
}

async function handleSavedLocation() {
    const savedLocationId = localStorage.getItem('naijabites_selected_location');
    const savedLocationData = localStorage.getItem('naijabites_location_data');
    
    if (savedLocationId && savedLocationData) {
        try {
            const locationData = JSON.parse(savedLocationData);
            const currentLocation = allLocations.find(loc => loc.id === savedLocationId);
            
            if (currentLocation && currentLocation.isActive) {
                await selectLocation(currentLocation);
            } else {
                // Saved location no longer active, show modal
                setTimeout(() => showLocationModal(), 1000);
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
            setTimeout(() => showLocationModal(), 1000);
        }
    } else {
        // First time user, show location modal
        setTimeout(() => showLocationModal(), 1000);
    }
}

function showLocationModal() {
    const locationModal = document.getElementById('locationModal');
    const locationOverlay = document.getElementById('locationOverlay');
    
    if (locationModal && locationOverlay) {
        locationModal.classList.add('active');
        locationOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function hideLocationModal() {
    const locationModal = document.getElementById('locationModal');
    const locationOverlay = document.getElementById('locationOverlay');
    
    if (locationModal && locationOverlay) {
        locationModal.classList.remove('active');
        locationOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function updateStoreStatus(location) {
    const storeStatus = document.getElementById('storeStatus');
    const statusMessage = document.getElementById('statusMessage');
    const storeHours = document.getElementById('storeHours');
    const storePhone = document.getElementById('storePhone');
    
    if (storeStatus && statusMessage && storeHours && storePhone) {
        statusMessage.innerHTML = `
            <i class="fas fa-store"></i>
            Currently ordering from <strong>${location.name}</strong>
        `;
        
        storeHours.textContent = location.hours;
        storePhone.href = `tel:${location.phone}`;
        storePhone.innerHTML = `<i class="fas fa-phone"></i> ${location.phone}`;
        
        storeStatus.style.display = 'block';
    }
}

// =============================================================================
// DEALS MANAGEMENT
// =============================================================================

async function loadDeals() {
    try {
        const [dailyResponse, flashResponse, comboResponse] = await Promise.all([
            fetch(API_ENDPOINTS.dailyDeals).catch(() => ({ json: () => [] })),
            fetch(API_ENDPOINTS.flashSales).catch(() => ({ json: () => [] })),
            fetch(API_ENDPOINTS.comboDeals).catch(() => ({ json: () => [] }))
        ]);
        
        activeDeals.daily = dailyResponse.ok ? await dailyResponse.json() : [];
        activeDeals.flash = flashResponse.ok ? await flashResponse.json() : [];
        activeDeals.combo = comboResponse.ok ? await comboResponse.json() : [];
        
        displayDeals();
        
        console.log('🔥 Loaded deals:', {
            daily: activeDeals.daily.length,
            flash: activeDeals.flash.length,
            combo: activeDeals.combo.length
        });
        
    } catch (error) {
        console.error('Error loading deals:', error);
    }
}

async function loadLocationDeals(locationId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.dailyDeals}?location=${locationId}`);
        if (response.ok) {
            const locationDeals = await response.json();
            displayLocationSpecificDeals(locationDeals);
        }
    } catch (error) {
        console.error('Error loading location deals:', error);
    }
}

function displayDeals() {
    const dealsSection = document.getElementById('dealsSection');
    if (!dealsSection) return;
    
    const hasDeals = activeDeals.daily.length > 0 || 
                    activeDeals.flash.length > 0 || 
                    activeDeals.combo.length > 0;
    
    if (hasDeals) {
        dealsSection.style.display = 'block';
        
        if (activeDeals.daily.length > 0) {
            document.getElementById('dailyDeals').style.display = 'block';
            displayDailyDeals(activeDeals.daily);
        }
        
        if (activeDeals.flash.length > 0) {
            document.getElementById('flashSales').style.display = 'block';
            displayFlashSales(activeDeals.flash);
            startFlashSaleTimer();
        }
        
        if (activeDeals.combo.length > 0) {
            document.getElementById('comboDeals').style.display = 'block';
            displayComboDeals(activeDeals.combo);
        }
    } else {
        dealsSection.style.display = 'none';
    }
}

function displayDailyDeals(deals) {
    const grid = document.getElementById('dailyDealsGrid');
    if (!grid) return;
    
    grid.innerHTML = deals.map(deal => `
        <div class="deal-card daily-deal" data-deal-id="${deal.id}">
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy" 
                     onerror="this.src='/images/placeholder-food.jpg'">
                <div class="deal-badge">${deal.discount}% OFF</div>
            </div>
            <div class="deal-content">
                <h4>${deal.title}</h4>
                <p>${deal.description}</p>
                <div class="deal-pricing">
                    <span class="original-price">₦${deal.originalPrice.toLocaleString()}</span>
                    <span class="deal-price">₦${deal.dealPrice.toLocaleString()}</span>
                </div>
                <button class="add-deal-btn" onclick="addDealToCart('${deal.id}', 'daily')">
                    <i class="fas fa-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function displayFlashSales(deals) {
    const grid = document.getElementById('flashSalesGrid');
    if (!grid) return;
    
    grid.innerHTML = deals.map(deal => `
        <div class="deal-card flash-deal" data-deal-id="${deal.id}">
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy"
                     onerror="this.src='/images/placeholder-food.jpg'">
                <div class="deal-badge flash">⚡ ${deal.discount}% OFF</div>
            </div>
            <div class="deal-content">
                <h4>${deal.title}</h4>
                <p>${deal.description}</p>
                <div class="deal-pricing">
                    <span class="original-price">₦${deal.originalPrice.toLocaleString()}</span>
                    <span class="deal-price">₦${deal.dealPrice.toLocaleString()}</span>
                </div>
                <div class="deal-timer">
                    <i class="fas fa-clock"></i>
                    <span class="time-left" data-end-time="${deal.endTime}">Calculating...</span>
                </div>
                <button class="add-deal-btn" onclick="addDealToCart('${deal.id}', 'flash')">
                    <i class="fas fa-bolt"></i> Grab Deal
                </button>
            </div>
        </div>
    `).join('');
}

function displayComboDeals(deals) {
    const grid = document.getElementById('comboDealsGrid');
    if (!grid) return;
    
    grid.innerHTML = deals.map(deal => `
        <div class="deal-card combo-deal" data-deal-id="${deal.id}">
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy"
                     onerror="this.src='/images/placeholder-combo.jpg'">
                <div class="deal-badge combo">COMBO</div>
            </div>
            <div class="deal-content">
                <h4>${deal.title}</h4>
                <p>${deal.description}</p>
                <div class="combo-items">
                    ${deal.items.map(item => `<span class="combo-item">${item}</span>`).join('')}
                </div>
                <div class="deal-pricing">
                    <span class="original-price">₦${deal.originalPrice.toLocaleString()}</span>
                    <span class="deal-price">₦${deal.dealPrice.toLocaleString()}</span>
                    <span class="savings">Save ₦${(deal.originalPrice - deal.dealPrice).toLocaleString()}</span>
                </div>
                <button class="add-deal-btn" onclick="addDealToCart('${deal.id}', 'combo')">
                    <i class="fas fa-layer-group"></i> Get Combo
                </button>
            </div>
        </div>
    `).join('');
}

function addDealToCart(dealId, dealType) {
    if (!selectedLocation) {
        showNotification('Please select a location first', 'error');
        return;
    }
    
    const deal = activeDeals[dealType].find(d => d.id === dealId);
    if (deal) {
        const cartItem = {
            id: `deal_${dealType}_${dealId}`,
            name: deal.title,
            price: deal.dealPrice,
            originalPrice: deal.originalPrice,
            unit: 'deal',
            quantity: 1,
            isDeal: true,
            dealType: dealType,
            dealId: dealId,
            location: selectedLocation
        };
        
        // Check if deal already in cart
        const existingDeal = cart.find(item => item.id === cartItem.id);
        if (existingDeal) {
            existingDeal.quantity += 1;
        } else {
            cart.push(cartItem);
        }
        
        updateCartDisplay();
        updateQuickCartCount();
        saveCartToStorage();
        
        showNotification(`${deal.title} added to cart!`, 'success');
        
        // Track deal conversion
        trackEvent('deal_added_to_cart', {
            dealId: dealId,
            dealType: dealType,
            location: selectedLocation,
            dealPrice: deal.dealPrice,
            originalPrice: deal.originalPrice,
            timestamp: new Date().toISOString()
        });
    }
}

// =============================================================================
// CATEGORY MANAGEMENT
// =============================================================================

function updateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
        categories.map(category => 
            `<option value="${category.slug}">${category.name}</option>`
        ).join('');
}

function updateFooterLocations(locations) {
    const footerLocations = document.getElementById('footerLocations');
    if (footerLocations) {
        footerLocations.innerHTML = locations.map(location => 
            `<li><i class="fas fa-map-marker-alt"></i> ${location.name}</li>`
        ).join('');
    }
}

function updateActiveLocationsCount(count) {
    const activeLocationsCount = document.getElementById('activeLocationsCount');
    if (activeLocationsCount) {
        activeLocationsCount.textContent = `${count} Locations`;
    }
}

// =============================================================================
// EXISTING FUNCTIONALITY (Updated for Nigerian Food Business)
// =============================================================================

// Event Listeners Setup
function initializeEventListeners() {
    // Location overlay click handler
    const locationOverlay = document.getElementById('locationOverlay');
    if (locationOverlay) {
        locationOverlay.addEventListener('click', function() {
            const savedLocation = localStorage.getItem('naijabites_selected_location');
            if (savedLocation) {
                hideLocationModal();
            }
        });
    }
    
    // Delivery toggle
    const deliveryToggle = document.getElementById('deliveryToggle');
    if (deliveryToggle) {
        deliveryToggle.addEventListener('change', handleDeliveryToggle);
    }
    
    // Search and filters
    const searchFilter = document.getElementById('searchFilter');
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(applyFilters, 300));
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    const availabilityFilter = document.getElementById('availabilityFilter');
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', applyFilters);
    }
    
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmission);
    }
    
    // Window events
    window.addEventListener('beforeunload', saveCartToStorage);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Visibility change for tab switching
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

// Delivery mode handling
function handleDeliveryToggle(event) {
    isDeliveryMode = event.target.checked;
    updateDeliveryInfo();
    updateCartSummary();
    
    // Save preference
    localStorage.setItem('naijabites_delivery_mode', isDeliveryMode);
    
    trackEvent('delivery_toggle', {
        isDelivery: isDeliveryMode,
        location: selectedLocation,
        timestamp: new Date().toISOString()
    });
    
    showNotification(
        isDeliveryMode ? 'Switched to delivery mode' : 'Switched to pickup mode',
        'info'
    );
}

function updateDeliveryInfo() {
    const deliveryInfo = document.getElementById('deliveryInfo');
    if (!deliveryInfo) return;
    
    const deliveryOption = deliveryInfo.querySelector('.delivery-option');
    
    if (isDeliveryMode && currentLocationData) {
        deliveryOption.innerHTML = `
            <i class="fas fa-motorcycle"></i>
            <span>Delivery - ₦${deliveryFee.toLocaleString()}</span>
        `;
    } else {
        deliveryOption.innerHTML = `
            <i class="fas fa-store"></i>
            <span>Pickup - FREE</span>
        `;
    }
}

// Product display functions
function displayProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    const filteredProducts = getFilteredProducts();
    
    if (!selectedLocation) {
        productGrid.innerHTML = createNoLocationMessage();
        hideProductsStats();
        return;
    }
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = createNoProductsMessage();
        hideProductsStats();
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    productGrid.innerHTML = paginatedProducts.map((product, index) => 
        createProductCard(product, index)
    ).join('');
    
    updateLoadMoreButton(filteredProducts.length, endIndex);
    showProductsStats();
    updateProductsStats();
    observeProductCards();
}

function createProductCard(product, index) {
    const stock = product.stock ? (product.stock[selectedLocation] || 0) : 0;
    const stockStatus = getStockStatus(stock);
    const isInCart = cart.find(item => item.id === product.id);
    const cartQuantity = isInCart ? isInCart.quantity : 0;
    
    return `
        <div class="product-card fade-in" data-product-id="${product.id}" style="animation-delay: ${index * 0.1}s">
            <div class="product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" loading="lazy" 
                          onerror="this.src='/images/placeholder-food.jpg'">` :
                    `<div class="product-placeholder">
                        <i class="fas ${getProductIcon(product.category)}"></i>
                        <span>${product.name}</span>
                     </div>`
                }
                <div class="stock-badge ${stockStatus.class}">${stockStatus.text}</div>
                ${product.isSpicy ? '<div class="spicy-badge"><i class="fas fa-pepper-hot"></i></div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${getCategoryName(product.category)}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-details">
                    <span class="prep-time"><i class="fas fa-clock"></i> ${product.prepTime || '15-20 mins'}</span>
                    ${product.isSpicy ? '<span class="spicy-indicator"><i class="fas fa-pepper-hot"></i> Spicy</span>' : ''}
                </div>
                <div class="product-price">₦${product.price.toLocaleString()}/${product.unit}</div>
                <div class="product-stock">
                    <i class="fas fa-utensils"></i>
                    Available: ${stock} ${product.unit}${stock !== 1 ? 's' : ''}
                </div>
                
                ${stock > 0 ? `
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${product.id}, -1)" 
                                ${cartQuantity <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${cartQuantity}" 
                               min="0" max="${stock}" 
                               onchange="setQuantity(${product.id}, this.value)">
                        <button class="quantity-btn" onclick="updateQuantity(${product.id}, 1)" 
                                ${cartQuantity >= stock ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" 
                            ${stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                        Add to Order
                    </button>
                ` : `
                    <button class="add-to-cart-btn" disabled>
                        <i class="fas fa-times"></i>
                        Currently Unavailable
                    </button>
                `}
            </div>
        </div>
    `;
}

function createNoLocationMessage() {
    return `
        <div class="no-location-message">
            <i class="fas fa-map-marker-alt"></i>
            <h3>Select Your Kitchen</h3>
            <p>Please choose a kitchen location to view our delicious Nigerian dishes and their availability.</p>
            <button class="cta-btn" onclick="showLocationModal()">
                <i class="fas fa-map-marker-alt"></i>
                Choose Kitchen
            </button>
        </div>
    `;
}

function createNoProductsMessage() {
    return `
        <div class="no-products-message">
            <i class="fas fa-search"></i>
            <h3>No Dishes Found</h3>
            <p>Try adjusting your search or filter criteria to find what you're craving.</p>
            <button class="cta-btn" onclick="clearAllFilters()">
                <i class="fas fa-times"></i>
                Clear Filters
            </button>
        </div>
    `;
}

function getCategoryName(categorySlug) {
    const category = allCategories.find(cat => cat.slug === categorySlug);
    return category ? category.name : categorySlug;
}

function getProductIcon(category) {
    const icons = {
        'rice-pasta': 'fa-bowl-rice',
        'swallow': 'fa-bread-slice',
        'soups': 'fa-bowl-hot',
        'side-dishes': 'fa-leaf',
        'pastries': 'fa-cookie-bite',
        'cakes': 'fa-birthday-cake',
        'proteins': 'fa-drumstick-bite',
        'others': 'fa-utensils'
    };
    return icons[category] || 'fa-utensils';
}

function getStockStatus(stock) {
    if (stock === 0) {
        return { class: 'out-of-stock', text: 'Unavailable' };
    } else if (stock <= 5) {
        return { class: 'low-stock', text: 'Limited' };
    } else {
        return { class: 'in-stock', text: 'Available' };
    }
}

// Filtering and sorting
function getFilteredProducts() {
    let filtered = [...products];
    
    // Filter by search term
    const searchTerm = document.getElementById('searchFilter')?.value?.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (product.ingredients && product.ingredients.some(ing => 
                ing.toLowerCase().includes(searchTerm)
            ))
        );
    }
    
    // Filter by category
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    if (categoryFilter) {
        filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Filter by availability
    const availabilityFilter = document.getElementById('availabilityFilter')?.value;
    if (availabilityFilter && selectedLocation) {
        filtered = filtered.filter(product => {
            const stock = product.stock ? (product.stock[selectedLocation] || 0) : 0;
            switch (availabilityFilter) {
                case 'available':
                    return stock > 5;
                case 'limited':
                    return stock > 0 && stock <= 5;
                case 'unavailable':
                    return stock === 0;
                default:
                    return true;
            }
        });
    }
    
    // Sort products
    const sortFilter = document.getElementById('sortFilter')?.value;
    filtered.sort((a, b) => {
        switch (sortFilter) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'popularity':
                return (b.popularity || 0) - (a.popularity || 0);
            case 'prep-time':
                const timeA = parseInt(a.prepTime) || 20;
                const timeB = parseInt(b.prepTime) || 20;
                return timeA - timeB;
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    return filtered;
}

function applyFilters() {
    currentPage = 1;
    displayProducts();
    
    trackEvent('filters_applied', {
        search: document.getElementById('searchFilter')?.value || '',
        category: document.getElementById('categoryFilter')?.value || '',
        availability: document.getElementById('availabilityFilter')?.value || '',
        sort: document.getElementById('sortFilter')?.value || '',
        location: selectedLocation,
        timestamp: new Date().toISOString()
    });
}

function clearAllFilters() {
    document.getElementById('searchFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('availabilityFilter').value = '';
    document.getElementById('sortFilter').value = 'name';
    
    applyFilters();
    showNotification('All filters cleared', 'info');
}

// Products Statistics
function showProductsStats() {
    const productsStats = document.getElementById('productsStats');
    if (productsStats) {
        productsStats.style.display = 'flex';
    }
}

function hideProductsStats() {
    const productsStats = document.getElementById('productsStats');
    if (productsStats) {
        productsStats.style.display = 'none';
    }
}

function updateProductsStats() {
    if (!selectedLocation) return;
    
    const totalProducts = products.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    
    products.forEach(product => {
        const stock = product.stock ? (product.stock[selectedLocation] || 0) : 0;
        if (stock > 5) {
            inStockCount++;
        } else if (stock > 0) {
            lowStockCount++;
        }
    });
    
    const totalProductsEl = document.getElementById('totalProductsCount');
    const inStockEl = document.getElementById('inStockCount');
    const lowStockEl = document.getElementById('lowStockCount');
    
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (inStockEl) inStockEl.textContent = inStockCount;
    if (lowStockEl) lowStockEl.textContent = lowStockCount;
}

// Load More Functionality
function updateLoadMoreButton(totalItems, currentEndIndex) {
    const loadMoreSection = document.getElementById('loadMoreSection');
    
    if (totalItems > currentEndIndex) {
        loadMoreSection.style.display = 'block';
    } else {
        loadMoreSection.style.display = 'none';
    }
}

function loadMoreProducts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) return;
    
    const originalText = loadMoreBtn.innerHTML;
    
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        currentPage++;
        displayProducts();
        
        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.disabled = false;
        
        showNotification('More dishes loaded', 'success');
        
        // Scroll to new products
        const productCards = document.querySelectorAll('.product-card');
        if (productCards.length > 0) {
            const newProductIndex = (currentPage - 1) * itemsPerPage;
            if (productCards[newProductIndex]) {
                productCards[newProductIndex].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }, 800);
}

// =============================================================================
// CART FUNCTIONALITY
// =============================================================================

function addToCart(productId) {
    if (!selectedLocation) {
        showNotification('Please select a location first', 'error');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const availableStock = product.stock ? (product.stock[selectedLocation] || 0) : 0;
    if (availableStock <= 0) {
        showNotification('Dish is currently unavailable', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity < availableStock) {
            existingItem.quantity += 1;
            showNotification(`Added another ${product.name} to your order`, 'success');
        } else {
            showNotification('Cannot add more than available stock', 'warning');
            return;
        }
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            unit: product.unit,
            quantity: 1,
            location: selectedLocation,
            category: product.category,
            isDeal: false
        });
        showNotification(`${product.name} added to your order`, 'success');
    }
    
    updateCartDisplay();
    updateQuickCartCount();
    displayProducts();
    saveCartToStorage();
    
    trackEvent('add_to_cart', {
        productId: productId,
        productName: product.name,
        price: product.price,
        quantity: 1,
        location: selectedLocation,
        category: product.category,
        timestamp: new Date().toISOString()
    });
}

function updateQuantity(productId, change) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const availableStock = product.stock ? (product.stock[selectedLocation] || 0) : 0;
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= availableStock) {
            existingItem.quantity = newQuantity;
            updateCartDisplay();
            updateQuickCartCount();
            displayProducts();
            saveCartToStorage();
        } else {
            showNotification('Cannot exceed available stock', 'warning');
        }
    } else if (change > 0) {
        addToCart(productId);
    }
}

function setQuantity(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const availableStock = product.stock ? (product.stock[selectedLocation] || 0) : 0;
    const newQuantity = parseInt(quantity) || 0;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
    } else if (newQuantity <= availableStock) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity = newQuantity;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                unit: product.unit,
                quantity: newQuantity,
                location: selectedLocation,
                category: product.category,
                isDeal: false
            });
        }
        updateCartDisplay();
        updateQuickCartCount();
        displayProducts();
        saveCartToStorage();
    } else {
        showNotification('Cannot exceed available stock', 'warning');
        displayProducts();
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        const item = cart[index];
        cart.splice(index, 1);
        showNotification(`Removed ${item.name} from your order`, 'success');
        updateCartDisplay();
        updateQuickCartCount();
        displayProducts();
        saveCartToStorage();
        
        trackEvent('remove_from_cart', {
            productId: productId,
            productName: item.name,
            location: selectedLocation,
            timestamp: new Date().toISOString()
        });
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        if (cartItems) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-utensils"></i>
                    <p>Your order is empty</p>
                    <small>Add delicious dishes to get started</small>
                </div>
            `;
        }
        if (cartSummary) cartSummary.style.display = 'none';
    } else {
        if (cartItems) {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <i class="fas ${getProductIcon(item.category)}"></i>
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">
                            ${item.name}
                            ${item.isDeal ? '<span class="deal-indicator">DEAL</span>' : ''}
                        </div>
                        <div class="cart-item-price">
                            ₦${item.price.toLocaleString()}/${item.unit}
                            ${item.originalPrice ? `<span class="original-price">₦${item.originalPrice.toLocaleString()}</span>` : ''}
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantity}" 
                                   onchange="setQuantity(${item.id}, this.value)" min="1">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-item" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        if (cartSummary) {
            cartSummary.style.display = 'block';
            updateCartSummary();
        }
    }
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currentDeliveryFee = isDeliveryMode && subtotal < freeDeliveryThreshold ? deliveryFee : 0;
    const total = subtotal + currentDeliveryFee;
    
    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('deliveryFee');
    const totalAmountEl = document.getElementById('totalAmount');
    
    if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
    if (deliveryFeeEl) {
        if (isDeliveryMode && subtotal >= freeDeliveryThreshold) {
            deliveryFeeEl.innerHTML = `<span style="text-decoration: line-through;">₦${deliveryFee.toLocaleString()}</span> <span style="color: #27ae60; font-weight: bold;">FREE</span>`;
        } else {
            deliveryFeeEl.textContent = `₦${currentDeliveryFee.toLocaleString()}`;
        }
    }
    if (totalAmountEl) totalAmountEl.textContent = `₦${total.toLocaleString()}`;
}

function updateQuickCartCount() {
    const quickCartCount = document.getElementById('quickCartCount');
    if (quickCartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        quickCartCount.textContent = totalItems;
        quickCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Cart sidebar toggle
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        const isOpen = cartSidebar.classList.contains('open');
        
        if (isOpen) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

// =============================================================================
// CHECKOUT FUNCTIONALITY
// =============================================================================

function showCheckoutForm() {
    if (!selectedLocation || !currentLocationData) {
        showNotification('Please select a location first', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your order is empty', 'error');
        return;
    }
    
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.add('active');
        updateCheckoutSections();
        updateCheckoutOrderSummary();
        document.body.style.overflow = 'hidden';
        
        trackEvent('checkout_started', {
            cartValue: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            location: selectedLocation,
            deliveryType: isDeliveryMode ? 'delivery' : 'pickup',
            timestamp: new Date().toISOString()
        });
    }
}

function closeCheckoutForm() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
        
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.reset();
        }
    }
}

function updateCheckoutSections() {
    const deliverySection = document.getElementById('deliverySection');
    const pickupSection = document.getElementById('pickupSection');
    const deliveryAddress = document.getElementById('deliveryAddress');
    
    if (isDeliveryMode) {
        if (deliverySection) deliverySection.style.display = 'block';
        if (pickupSection) pickupSection.style.display = 'none';
        if (deliveryAddress) deliveryAddress.required = true;
    } else {
        if (deliverySection) deliverySection.style.display = 'none';
        if (pickupSection) pickupSection.style.display = 'block';
        if (deliveryAddress) deliveryAddress.required = false;
        
        // Update pickup location info
        if (currentLocationData) {
            const pickupLocationName = document.getElementById('pickupLocationName');
            const pickupLocationAddress = document.getElementById('pickupLocationAddress');
            
            if (pickupLocationName) pickupLocationName.textContent = currentLocationData.name;
            if (pickupLocationAddress) pickupLocationAddress.textContent = currentLocationData.address;
        }
    }
}

function updateCheckoutOrderSummary() {
    const summaryContainer = document.getElementById('checkoutOrderSummary');
    if (!summaryContainer) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currentDeliveryFee = isDeliveryMode && subtotal < freeDeliveryThreshold ? deliveryFee : 0;
    const total = subtotal + currentDeliveryFee;
    
    summaryContainer.innerHTML = `
        <div class="order-items">
            ${cart.map(item => `
                <div class="order-item">
                    <span>${item.quantity}x ${item.name} ${item.isDeal ? '(Deal)' : ''}</span>
                    <span>₦${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('')}
        </div>
        <div class="order-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₦${subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
                <span>${isDeliveryMode ? 'Delivery Fee:' : 'Pickup:'}</span>
                <span>${isDeliveryMode ? 
                    (subtotal >= freeDeliveryThreshold ? 
                        '<span style="text-decoration: line-through;">₦' + deliveryFee.toLocaleString() + '</span> <span style="color: #27ae60;">FREE</span>' : 
                        '₦' + currentDeliveryFee.toLocaleString()) : 
                    'FREE'}</span>
            </div>
            <div class="total-row final-total">
                <span><strong>Total:</strong></span>
                <span><strong>₦${total.toLocaleString()}</strong></span>
            </div>
        </div>
    `;
}

function handleCheckoutSubmission(event) {
    event.preventDefault();
    
    // Validate form
    const customerName = document.getElementById('customerName')?.value;
    const customerPhone = document.getElementById('customerPhone')?.value;
    const customerEmail = document.getElementById('customerEmail')?.value;
    
    if (!customerName || !customerPhone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidPhoneNumber(customerPhone)) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    if (customerEmail && !isValidEmail(customerEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Build WhatsApp message
    const orderMessage = buildOrderMessage(customerName, customerPhone, customerEmail);
    
    // Get WhatsApp number for selected location
    const whatsappNumber = currentLocationData.phone.replace('+', '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
    
    // Track order completion
    const orderId = generateOrderId();
    trackEvent('order_completed', {
        orderId: orderId,
        customerName: customerName,
        customerPhone: customerPhone,
        location: selectedLocation,
        deliveryType: isDeliveryMode ? 'delivery' : 'pickup',
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        orderValue: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 
                   (isDeliveryMode && cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) < freeDeliveryThreshold ? deliveryFee : 0),
        timestamp: new Date().toISOString()
    });
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and close modals
    cart = [];
    updateCartDisplay();
    updateQuickCartCount();
    displayProducts();
    closeCheckoutForm();
    toggleCart();
    saveCartToStorage();
    
    showNotification('Order sent via WhatsApp! Thank you for choosing Naija Bites.', 'success');
}

function buildOrderMessage(customerName, customerPhone, customerEmail) {
    let orderMessage = `🍽️ *New Order from ${currentLocationData.name}*\n\n`;
    
    orderMessage += `*👤 Customer Information:*\n`;
    orderMessage += `Name: ${customerName}\n`;
    orderMessage += `Phone: ${customerPhone}\n`;
    if (customerEmail) orderMessage += `Email: ${customerEmail}\n`;
    
    if (isDeliveryMode) {
        const deliveryAddress = document.getElementById('deliveryAddress')?.value;
        const deliveryInstructions = document.getElementById('deliveryInstructions')?.value;
        
        orderMessage += `\n*🚚 Delivery Details:*\n`;
        orderMessage += `📍 Address: ${deliveryAddress}\n`;
        if (deliveryInstructions) orderMessage += `📝 Instructions: ${deliveryInstructions}\n`;
    } else {
        const pickupTime = document.getElementById('pickupTime')?.value;
        const pickupNotes = document.getElementById('pickupNotes')?.value;
        
        orderMessage += `\n*🏪 Pickup Details:*\n`;
        orderMessage += `Location: ${currentLocationData.name}\n`;
        orderMessage += `📍 Address: ${currentLocationData.address}\n`;
        if (pickupTime) orderMessage += `🕒 Preferred Time: ${getPickupTimeText(pickupTime)}\n`;
        if (pickupNotes) orderMessage += `📝 Notes: ${pickupNotes}\n`;
    }
    
    // Add order items
    orderMessage += `\n*🍽️ Order Items:*\n`;
    cart.forEach(item => {
        orderMessage += `• ${item.name}${item.isDeal ? ' (Deal)' : ''} - ${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''} @ ₦${item.price.toLocaleString()} each\n`;
        if (item.originalPrice) {
            orderMessage += `  *Original Price: ₦${item.originalPrice.toLocaleString()} - You saved ₦${((item.originalPrice - item.price) * item.quantity).toLocaleString()}!*\n`;
        }
    });
    
    // Add totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currentDeliveryFee = isDeliveryMode && subtotal < freeDeliveryThreshold ? deliveryFee : 0;
    const total = subtotal + currentDeliveryFee;
    
    orderMessage += `\n*💰 Order Summary:*\n`;
    orderMessage += `Subtotal: ₦${subtotal.toLocaleString()}\n`;
    orderMessage += `${isDeliveryMode ? 'Delivery Fee' : 'Pickup'}: ${isDeliveryMode ? 
        (subtotal >= freeDeliveryThreshold ? 'FREE (₦' + deliveryFee.toLocaleString() + ' waived)' : '₦' + currentDeliveryFee.toLocaleString()) : 
        'FREE'}\n`;
    orderMessage += `*Total: ₦${total.toLocaleString()}*\n\n`;
    
    orderMessage += `🕒 Order Date: ${new Date().toLocaleDateString()}\n`;
    orderMessage += `📱 Ordered via Naija Bites App\n\n`;
    orderMessage += `Please confirm availability and estimated preparation time. Thank you! 🙏`;
    
    return orderMessage;
}

function getPickupTimeText(value) {
    const timeOptions = {
        'asap': 'ASAP (30-45 mins)',
        'lunch': 'Lunch Time (12PM - 2PM)',
        'evening': 'Evening (6PM - 8PM)',
        'custom': 'Custom time (please specify)'
    };
    return timeOptions[value] || value;
}

// =============================================================================
// REFRESH & SYNC FUNCTIONS
// =============================================================================

async function refreshData() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) refreshBtn.classList.add('spinning');
    
    try {
        await Promise.all([
            loadLocations(),
            loadCategories(),
            loadDeals()
        ]);
        
        if (selectedLocation) {
            await loadLocationProducts(selectedLocation);
        }
        
        showNotification('Menu refreshed successfully', 'success');
        
        trackEvent('manual_refresh', {
            location: selectedLocation,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error refreshing data:', error);
        showNotification('Failed to refresh data', 'error');
    } finally {
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
}

function setupRefreshIntervals() {
    // Refresh deals every 5 minutes
    setInterval(loadDeals, 5 * 60 * 1000);
    
    // Refresh products every 10 minutes
    setInterval(() => {
        if (selectedLocation) {
            loadLocationProducts(selectedLocation);
        }
    }, 10 * 60 * 1000);
    
    // Update flash sale timers every second
    setInterval(updateFlashSaleTimers, 1000);
}

function startFlashSaleTimer() {
    if (activeDeals.flash.length > 0) {
        const nearestEndTime = Math.min(...activeDeals.flash.map(deal => new Date(deal.endTime).getTime()));
        updateMainFlashTimer(nearestEndTime);
    }
}

function updateFlashSaleTimers() {
    const timerElements = document.querySelectorAll('.time-left');
    
    timerElements.forEach(element => {
        const endTime = new Date(element.dataset.endTime).getTime();
        const now = new Date().getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            element.textContent = `${hours}h ${minutes}m ${seconds}s`;
        } else {
            element.textContent = 'Expired';
            element.parentElement.parentElement.classList.add('expired');
        }
    });
}

// =============================================================================
// PUSH NOTIFICATIONS
// =============================================================================

function setupNotifications() {
    if ('Notification' in window) {
        if (Notification.permission === 'default' && !localStorage.getItem('notificationBannerDismissed')) {
            setTimeout(() => {
                const notificationBanner = document.getElementById('notificationBanner');
                if (notificationBanner) {
                    notificationBanner.style.display = 'block';
                }
            }, 3000);
        }
    }
}

async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            await subscribeToNotifications();
            showNotification('Notifications enabled! You\'ll receive deal alerts and order updates.', 'success');
            dismissNotificationBanner();
        } else {
            showNotification('Notifications blocked. You can enable them in browser settings.', 'warning');
            dismissNotificationBanner();
        }
    }
}

async function subscribeToNotifications() {
    try {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'your-vapid-public-key' // Replace with your VAPID key
            });
            
            // Send subscription to backend
            await fetch(API_ENDPOINTS.notifications, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription,
                    location: selectedLocation,
                    timestamp: new Date().toISOString()
                })
            });
        }
    } catch (error) {
        console.error('Error subscribing to notifications:', error);
    }
}

function dismissNotificationBanner() {
    const notificationBanner = document.getElementById('notificationBanner');
    if (notificationBanner) {
        notificationBanner.style.display = 'none';
    }
    localStorage.setItem('notificationBannerDismissed', 'true');
}

// =============================================================================
// STORAGE FUNCTIONS
// =============================================================================

function saveCartToStorage() {
    try {
        localStorage.setItem('naijabites_cart', JSON.stringify(cart));
        localStorage.setItem('naijabites_delivery', isDeliveryMode.toString());
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('naijabites_cart');
        const savedDelivery = localStorage.getItem('naijabites_delivery');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        
        if (savedDelivery) {
            isDeliveryMode = savedDelivery === 'true';
            const deliveryToggle = document.getElementById('deliveryToggle');
            if (deliveryToggle) {
                deliveryToggle.checked = isDeliveryMode;
            }
            updateDeliveryInfo();
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
}

function loadUserPreferences() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('.theme-toggle-footer i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        const installBannerDismissed = localStorage.getItem('installBannerDismissed');
        if (installBannerDismissed === 'true') {
            const installBanner = document.getElementById('installBanner');
            if (installBanner) {
                installBanner.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    return `NB${timestamp.slice(-6)}${random.toUpperCase()}`;
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <p>
            <i class="fas ${icon}"></i>
            ${message}
        </p>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

function handleOnline() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
        offlineIndicator.style.display = 'none';
    }
    
    showNotification('Connection restored', 'success');
    refreshData();
}

function handleOffline() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
        offlineIndicator.style.display = 'block';
    }
    
    showNotification('You are now offline. Some features may not work.', 'warning');
}

function retryConnection() {
    if (navigator.onLine) {
        handleOnline();
    } else {
        showNotification('Still offline. Please check your connection.', 'error');
    }
}

function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden, reduce activity
        console.log('App is now in background');
    } else {
        // Page is visible, check for updates
        console.log('App is now in foreground');
        refreshData();
    }
}

// =============================================================================
// INTERSECTION OBSERVER
// =============================================================================

function observeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        productCards.forEach(card => {
            observer.observe(card);
        });
    }
}

// =============================================================================
// ANALYTICS AND TRACKING
// =============================================================================

function trackEvent(eventName, eventData) {
    try {
        const events = JSON.parse(localStorage.getItem('naijabites_analytics') || '[]');
        events.push({
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            sessionId: getSessionId()
        });
        
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('naijabites_analytics', JSON.stringify(events));
        console.log('📊 Analytics Event:', eventName, eventData);
    } catch (error) {
        console.error('Error tracking event:', error);
    }
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('naijabites_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('naijabites_session_id', sessionId);
    }
    return sessionId;
}

// =============================================================================
// MOBILE FEATURES
// =============================================================================

function setupMobileFeatures() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        setupMobileGestures();
        setupMobileOptimizations();
    }
}

function setupMobileGestures() {
    // Pull to refresh
    let startY = 0;
    let currentY = 0;
    let isScrolling = false;
    
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        productGrid.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 100 && window.scrollY === 0 && !isScrolling) {
                isScrolling = true;
                showNotification('Release to refresh menu', 'info');
            }
        }, { passive: true });
        
        productGrid.addEventListener('touchend', () => {
            if (isScrolling) {
                refreshData();
                isScrolling = false;
            }
        }, { passive: true });
    }
}

function setupMobileOptimizations() {
    let ticking = false;
    
    function updateScrollPosition() {
        const scrollY = window.scrollY;
        
        // Hide/show header on scroll
        const header = document.querySelector('.header');
        if (header) {
            if (scrollY > 100) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
        }
        
        // Update quick actions visibility
        const quickActions = document.getElementById('quickActionsCustomer');
        if (quickActions) {
            quickActions.style.display = scrollY > 200 ? 'flex' : 'none';
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }, { passive: true });
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        trackEvent('javascript_error', {
            message: event.error?.message || 'Unknown error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString()
        });
        
        showNotification('An error occurred. Please refresh if problems persist.', 'error');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        trackEvent('promise_rejection', {
            reason: event.reason?.toString() || 'Unknown rejection',
            timestamp: new Date().toISOString()
        });
    });
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchFilter');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const checkoutModal = document.getElementById('checkoutModal');
            const locationModal = document.getElementById('locationModal');
            const cartSidebar = document.getElementById('cartSidebar');
            
            if (checkoutModal && checkoutModal.classList.contains('active')) {
                closeCheckoutForm();
            } else if (locationModal && locationModal.classList.contains('active')) {
                const savedLocation = localStorage.getItem('naijabites_selected_location');
                if (savedLocation) {
                    hideLocationModal();
                }
            } else if (cartSidebar && cartSidebar.classList.contains('open')) {
                toggleCart();
            }
        }
        
        // Ctrl/Cmd + R to refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
    });
}

// =============================================================================
// THEME FUNCTIONS
// =============================================================================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.theme-toggle-footer i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showNotification(`Switched to ${newTheme} theme`, 'info');
    
    trackEvent('theme_toggle', {
        theme: newTheme,
        timestamp: new Date().toISOString()
    });
}

// =============================================================================
// PWA FUNCTIONS
// =============================================================================

function installApp() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                trackEvent('app_installed', {
                    timestamp: new Date().toISOString()
                });
            }
            window.deferredPrompt = null;
            const installBanner = document.getElementById('installBanner');
            if (installBanner) {
                installBanner.style.display = 'none';
            }
        });
    }
}

function dismissInstallBanner() {
    const installBanner = document.getElementById('installBanner');
    if (installBanner) {
        installBanner.style.display = 'none';
    }
    localStorage.setItem('installBannerDismissed', 'true');
    
    trackEvent('install_banner_dismissed', {
        timestamp: new Date().toISOString()
    });
}

// =============================================================================
// SCROLL FUNCTIONS
// =============================================================================

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    trackEvent('scroll_to_top', {
        timestamp: new Date().toISOString()
    });
}

function scrollToProducts() {
    const productsSection = document.getElementById('productsSection');
    if (productsSection) {
        productsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        trackEvent('scroll_to_products', {
            timestamp: new Date().toISOString()
        });
    }
}

// =============================================================================
// GLOBAL EXPORTS AND CLEANUP
// =============================================================================

// Export functions for global access
window.addToCart = addToCart;
window.addDealToCart = addDealToCart;
window.updateQuantity = updateQuantity;
window.setQuantity = setQuantity;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.showCheckoutForm = showCheckoutForm;
window.closeCheckoutForm = closeCheckoutForm;
window.refreshData = refreshData;
window.clearAllFilters = clearAllFilters;
window.scrollToTop = scrollToTop;
window.scrollToProducts = scrollToProducts;
window.toggleTheme = toggleTheme;
window.installApp = installApp;
window.dismissInstallBanner = dismissInstallBanner;
window.retryConnection = retryConnection;
window.loadMoreProducts = loadMoreProducts;
window.showLocationModal = showLocationModal;
window.hideLocationModal = hideLocationModal;
window.handleLocationSelection = handleLocationSelection;
window.requestNotificationPermission = requestNotificationPermission;
window.dismissNotificationBanner = dismissNotificationBanner;

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    saveCartToStorage();
    
    // Clear intervals
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    // Track session end
    trackEvent('session_end', {
        duration: Date.now() - (sessionStorage.getItem('session_start') || Date.now()),
        timestamp: new Date().toISOString()
    });
});

// Track session start
sessionStorage.setItem('session_start', Date.now());
trackEvent('session_start', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`
});

console.log('🚀 Naija Bites Customer App Script Loaded Successfully!');

// =============================================================================
// END OF SCRIPT
// =============================================================================
