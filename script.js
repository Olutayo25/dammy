// =============================================================================
// NAIJA BITES - ENHANCED CUSTOMER APP WITH PRODUCT VARIANTS
// Batch 1: Product Variants, Customization Foundation
// =============================================================================

// Global Variables (Enhanced)
let products = [];
let cart = [];
let selectedLocation = '';
let currentLocationData = null;
let isDeliveryMode = false;
let deliveryFee = 1500;
let freeDeliveryThreshold = 15000;
let currentPage = 1;
let itemsPerPage = 12;
let isLoading = false;
let syncInterval;
let lastSyncTime = null;

// New: Product Customization Variables
let currentProduct = null;
let currentVariantSelection = {};
let currentAddons = [];
let modalQuantity = 1;

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
    : 'https://your-backend-url.com';

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

// Enhanced fallback products with variants
const fallbackProducts = [
    {
        id: 1,
        name: "Jollof Rice",
        category: "rice-pasta",
        basePrice: 2500,
        unit: "plate",
        description: "Our signature Jollof rice cooked with aromatic spices and fresh tomatoes",
        image: "/images/jollof-rice.jpg",
        stock: { "ikeja": 25, "victoria-island": 20, "surulere": 30, "ajah": 15, "yaba": 35 },
        popularity: 98,
        prepTime: "20-25 mins",
        isSpicy: true,
        // NEW: Variant system
        hasVariants: true,
        variants: {
            sizes: [
                { id: 'regular', name: 'Regular', priceModifier: 0, description: 'Standard portion' },
                { id: 'large', name: 'Large', priceModifier: 800, description: 'Extra portion' },
                { id: 'family', name: 'Family Size', priceModifier: 2000, description: 'Serves 3-4 people' }
            ],
            spiceLevel: [
                { id: 'mild', name: 'Mild', priceModifier: 0 },
                { id: 'medium', name: 'Medium', priceModifier: 0 },
                { id: 'hot', name: 'Hot & Spicy', priceModifier: 0 }
            ]
        },
        addons: [
            { id: 'extra-meat', name: 'Extra Meat', price: 800 },
            { id: 'fried-plantain', name: 'Fried Plantain', price: 600 },
            { id: 'coleslaw', name: 'Coleslaw', price: 500 }
        ]
    },
    {
        id: 2,
        name: "Custom Birthday Cake",
        category: "cakes",
        basePrice: 8000,
        unit: "cake",
        description: "Delicious custom birthday cake made to your specifications",
        image: "/images/birthday-cake.jpg",
        stock: { "ikeja": 10, "victoria-island": 8, "surulere": 12, "ajah": 6, "yaba": 15 },
        popularity: 95,
        prepTime: "2-3 hours",
        isSpicy: false,
        // NEW: Advanced customization
        hasVariants: true,
        isCustomizable: true,
        variants: {
            sizes: [
                { id: 'small', name: 'Small (6 inches)', priceModifier: 0, description: 'Serves 4-6 people' },
                { id: 'medium', name: 'Medium (8 inches)', priceModifier: 3000, description: 'Serves 8-10 people' },
                { id: 'large', name: 'Large (10 inches)', priceModifier: 6000, description: 'Serves 12-15 people' }
            ],
            flavors: [
                { id: 'vanilla', name: 'Vanilla', priceModifier: 0 },
                { id: 'chocolate', name: 'Chocolate', priceModifier: 500 },
                { id: 'red-velvet', name: 'Red Velvet', priceModifier: 1000 },
                { id: 'carrot', name: 'Carrot', priceModifier: 800 }
            ],
            shapes: [
                { id: 'round', name: 'Round', priceModifier: 0 },
                { id: 'square', name: 'Square', priceModifier: 500 },
                { id: 'heart', name: 'Heart Shape', priceModifier: 1500 }
            ],
            frostings: [
                { id: 'buttercream', name: 'Buttercream', priceModifier: 0 },
                { id: 'fondant', name: 'Fondant', priceModifier: 2000 },
                { id: 'cream-cheese', name: 'Cream Cheese', priceModifier: 800 }
            ]
        },
        customization: {
            allowCustomText: true,
            maxTextLength: 50,
            allowColorChoice: true,
            availableColors: ['white', 'pink', 'blue', 'yellow', 'green']
        },
        addons: [
            { id: 'candles', name: 'Birthday Candles Set', price: 500 },
            { id: 'custom-topper', name: 'Custom Cake Topper', price: 2000 },
            { id: 'extra-decoration', name: 'Extra Decorations', price: 1500 }
        ]
    },
    {
        id: 3,
        name: "Egusi Soup",
        category: "soups",
        basePrice: 3500,
        unit: "portion",
        description: "Traditional Egusi soup with assorted meat and fresh vegetables",
        image: "/images/egusi-soup.jpg",
        stock: { "ikeja": 15, "victoria-island": 10, "surulere": 20, "ajah": 12, "yaba": 18 },
        popularity: 92,
        prepTime: "30-35 mins",
        isSpicy: true,
        hasVariants: true,
        variants: {
            sizes: [
                { id: 'regular', name: 'Regular Bowl', priceModifier: 0 },
                { id: 'large', name: 'Large Bowl', priceModifier: 1000 }
            ],
            proteins: [
                { id: 'assorted', name: 'Assorted Meat', priceModifier: 0 },
                { id: 'beef-only', name: 'Beef Only', priceModifier: 500 },
                { id: 'chicken-only', name: 'Chicken Only', priceModifier: 800 },
                { id: 'fish-only', name: 'Fish Only', priceModifier: 1200 }
            ]
        },
        addons: [
            { id: 'extra-protein', name: 'Extra Protein', price: 1000 },
            { id: 'stockfish', name: 'Stockfish', price: 800 }
        ]
    },
    {
        id: 4,
        name: "Meat Pie",
        category: "pastries",
        basePrice: 800,
        unit: "piece",
        description: "Crispy pastry filled with seasoned minced meat and vegetables",
        image: "/images/meat-pie.jpg",
        stock: { "ikeja": 40, "victoria-island": 35, "surulere": 30, "ajah": 45, "yaba": 38 },
        popularity: 88,
        prepTime: "5-10 mins",
        isSpicy: false,
        hasVariants: true,
        variants: {
            sizes: [
                { id: 'regular', name: 'Regular', priceModifier: 0 },
                { id: 'large', name: 'Large', priceModifier: 300 }
            ],
            quantity: [
                { id: 'single', name: '1 Piece', priceModifier: 0 },
                { id: 'pack-3', name: '3 Pieces', priceModifier: 1500 },
                { id: 'pack-6', name: '6 Pieces', priceModifier: 2800 }
            ]
        }
    }
    // Add more products with variants as needed...
];

// =============================================================================
// ENHANCED PRODUCT CARD CREATION
// =============================================================================

function createProductCard(product, index) {
    const stock = product.stock ? (product.stock[selectedLocation] || 0) : 0;
    const stockStatus = getStockStatus(stock);
    const isInCart = cart.find(item => item.productId === product.id);
    const cartQuantity = isInCart ? isInCart.quantity : 0;
    
    // NEW: Check if product has variants
    const hasVariants = product.hasVariants && product.variants;
    const isCustomizable = product.isCustomizable;
    
    // Calculate price range for variant products
    const priceDisplay = hasVariants ? getPriceDisplay(product) : `₦${product.basePrice.toLocaleString()}`;
    
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
                ${hasVariants ? '<div class="variant-badge"><i class="fas fa-cog"></i> Customizable</div>' : ''}
                ${isCustomizable ? '<div class="custom-badge"><i class="fas fa-magic"></i> Custom</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${getCategoryName(product.category)}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-details">
                    <span class="prep-time"><i class="fas fa-clock"></i> ${product.prepTime || '15-20 mins'}</span>
                    ${product.isSpicy ? '<span class="spicy-indicator"><i class="fas fa-pepper-hot"></i> Spicy</span>' : ''}
                </div>
                
                <!-- Enhanced Price Display -->
                <div class="product-price">
                    ${priceDisplay}/${product.unit}
                    ${hasVariants ? '<small class="price-note">Starting from</small>' : ''}
                </div>
                
                <div class="product-stock">
                    <i class="fas fa-utensils"></i>
                    Available: ${stock} ${product.unit}${stock !== 1 ? 's' : ''}
                </div>
                
                <!-- Variant Options Preview -->
                ${hasVariants ? createVariantPreview(product) : ''}
                
                ${stock > 0 ? `
                    ${hasVariants || isCustomizable ? `
                        <!-- Customizable Product Button -->
                        <button class="customize-product-btn" onclick="openProductCustomization(${product.id})">
                            <i class="fas ${isCustomizable ? 'fa-magic' : 'fa-cog'}"></i>
                            ${isCustomizable ? 'Customize & Order' : 'Choose Options'}
                        </button>
                    ` : `
                        <!-- Simple Product Controls -->
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
                    `}
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

function getPriceDisplay(product) {
    let minPrice = product.basePrice;
    let maxPrice = product.basePrice;
    
    // Calculate price range from variants
    if (product.variants) {
        Object.values(product.variants).forEach(variantGroup => {
            variantGroup.forEach(variant => {
                const price = product.basePrice + variant.priceModifier;
                minPrice = Math.min(minPrice, price);
                maxPrice = Math.max(maxPrice, price);
            });
        });
    }
    
    if (minPrice === maxPrice) {
        return `₦${minPrice.toLocaleString()}`;
    } else {
        return `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`;
    }
}

function createVariantPreview(product) {
    if (!product.variants) return '';
    
    const variantTypes = Object.keys(product.variants);
    const previewItems = variantTypes.slice(0, 2).map(type => {
        const count = product.variants[type].length;
        return `${count} ${type}`;
    });
    
    return `
        <div class="variant-preview">
            <small><i class="fas fa-layer-group"></i> ${previewItems.join(', ')}</small>
        </div>
    `;
}

// =============================================================================
// PRODUCT CUSTOMIZATION MODAL SYSTEM
// =============================================================================

function openProductCustomization(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    currentVariantSelection = {};
    currentAddons = [];
    modalQuantity = 1;
    
    // Populate modal
    populateProductModal(product);
    
    // Show modal
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('productModalOverlay');
    
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Track customization open
    trackEvent('product_customization_opened', {
        productId: product.id,
        productName: product.name,
        hasVariants: product.hasVariants,
        isCustomizable: product.isCustomizable,
        timestamp: new Date().toISOString()
    });
}

function populateProductModal(product) {
    // Set basic info
    document.getElementById('productModalTitle').textContent = product.name;
    document.getElementById('productModalImage').src = product.image || '/images/placeholder-food.jpg';
    document.getElementById('modalBasePrice').textContent = `₦${product.basePrice.toLocaleString()}`;
    document.getElementById('modalCurrentPrice').textContent = `₦${product.basePrice.toLocaleString()}`;
    document.getElementById('modalQuantity').value = modalQuantity;
    
    // Populate variants
    if (product.variants) {
        populateVariantOptions(product.variants);
    }
    
    // Populate add-ons
    if (product.addons) {
        populateAddons(product.addons);
    }
    
    // Set up customization options
    if (product.isCustomizable && product.customization) {
        setupCustomizationOptions(product.customization);
    }
    
    // Initial price calculation
    calculateModalPrice();
}

function populateVariantOptions(variants) {
    Object.entries(variants).forEach(([variantType, options]) => {
        const optionGroup = document.getElementById(`${variantType}Options`);
        const buttonContainer = document.getElementById(`${variantType}Buttons`);
        
        if (optionGroup && buttonContainer) {
            optionGroup.style.display = 'block';
            
            buttonContainer.innerHTML = options.map(option => `
                <button class="option-btn" 
                        data-variant-type="${variantType}" 
                        data-variant-id="${option.id}"
                        data-price-modifier="${option.priceModifier}"
                        onclick="selectVariant('${variantType}', '${option.id}', ${option.priceModifier})">
                    <div class="option-content">
                        <span class="option-name">${option.name}</span>
                        ${option.description ? `<small class="option-description">${option.description}</small>` : ''}
                        ${option.priceModifier > 0 ? `<span class="option-price">+₦${option.priceModifier.toLocaleString()}</span>` : ''}
                        ${option.priceModifier < 0 ? `<span class="option-discount">-₦${Math.abs(option.priceModifier).toLocaleString()}</span>` : ''}
                    </div>
                </button>
            `).join('');
            
            // Auto-select first option for required variants
            if (options.length > 0) {
                selectVariant(variantType, options[0].id, options[0].priceModifier);
            }
        }
    });
}

function populateAddons(addons) {
    const addonsGroup = document.getElementById('addonsOptions');
    const addonsList = document.getElementById('addonsList');
    
    if (addonsGroup && addonsList) {
        addonsGroup.style.display = 'block';
        
        addonsList.innerHTML = addons.map(addon => `
            <div class="addon-item">
                <label class="addon-checkbox">
                    <input type="checkbox" 
                           data-addon-id="${addon.id}" 
                           data-addon-price="${addon.price}"
                           onchange="toggleAddon('${addon.id}', ${addon.price}, this.checked)">
                    <span class="checkmark"></span>
                    <div class="addon-info">
                        <span class="addon-name">${addon.name}</span>
                        <span class="addon-price">+₦${addon.price.toLocaleString()}</span>
                    </div>
                </label>
            </div>
        `).join('');
    }
}

function setupCustomizationOptions(customization) {
    // Custom text input
    if (customization.allowCustomText) {
        const customTextOption = document.getElementById('customTextOption');
        const customTextInput = document.getElementById('customText');
        
        if (customTextOption && customTextInput) {
            customTextOption.style.display = 'block';
            customTextInput.maxLength = customization.maxTextLength || 50;
            
            // Character counter
            customTextInput.addEventListener('input', function() {
                const charCounter = document.querySelector('.char-counter');
                if (charCounter) {
                    charCounter.textContent = `${this.value.length}/${this.maxLength} characters`;
                }
            });
        }
    }
}

function selectVariant(variantType, variantId, priceModifier) {
    // Update selection
    currentVariantSelection[variantType] = {
        id: variantId,
        priceModifier: priceModifier
    };
    
    // Update UI
    const buttons = document.querySelectorAll(`[data-variant-type="${variantType}"]`);
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.variantId === variantId) {
            btn.classList.add('selected');
        }
    });
    
    // Recalculate price
    calculateModalPrice();
}

function toggleAddon(addonId, price, isSelected) {
    if (isSelected) {
        currentAddons.push({ id: addonId, price: price });
    } else {
        currentAddons = currentAddons.filter(addon => addon.id !== addonId);
    }
    
    // Recalculate price
    calculateModalPrice();
}

function updateModalQuantity(change) {
    const quantityInput = document.getElementById('modalQuantity');
    const currentQty = parseInt(quantityInput.value) || 1;
    const newQty = Math.max(1, Math.min(10, currentQty + change));
    
    quantityInput.value = newQty;
    modalQuantity = newQty;
    
    calculateModalPrice();
}

function calculateModalPrice() {
    if (!currentProduct) return;
    
    let totalPrice = currentProduct.basePrice;
    
    // Add variant modifiers
    Object.values(currentVariantSelection).forEach(variant => {
        totalPrice += variant.priceModifier;
    });
    
    // Add addon prices
    currentAddons.forEach(addon => {
        totalPrice += addon.price;
    });
    
    const unitPrice = totalPrice;
    const finalPrice = totalPrice * modalQuantity;
    
    // Update display
    document.getElementById('modalCurrentPrice').textContent = `₦${unitPrice.toLocaleString()}`;
    document.getElementById('modalTotalPrice').textContent = `₦${finalPrice.toLocaleString()}`;
    
    // Update price breakdown
    updatePriceBreakdown(unitPrice);
}

function updatePriceBreakdown(unitPrice) {
    const breakdown = document.getElementById('priceBreakdown');
    if (!breakdown || !currentProduct) return;
    
    let breakdownHTML = `<div class="price-item">Base Price: ₦${currentProduct.basePrice.toLocaleString()}</div>`;
    
    // Show variant modifications
    Object.entries(currentVariantSelection).forEach(([type, variant]) => {
        if (variant.priceModifier !== 0) {
            const modifier = variant.priceModifier > 0 ? '+' : '';
            breakdownHTML += `<div class="price-item">${type}: ${modifier}₦${variant.priceModifier.toLocaleString()}</div>`;
        }
    });
    
    // Show addons
    currentAddons.forEach(addon => {
        breakdownHTML += `<div class="price-item">Add-on: +₦${addon.price.toLocaleString()}</div>`;
    });
    
    if (modalQuantity > 1) {
        breakdownHTML += `<div class="price-item">Quantity: ${modalQuantity}x</div>`;
    }
    
    breakdown.innerHTML = breakdownHTML;
}

function addCustomizedToCart() {
    if (!currentProduct || !selectedLocation) {
        showNotification('Please select a location first', 'error');
        return;
    }
    
    // Build customized cart item
    const customizedItem = {
        id: generateCartItemId(),
        productId: currentProduct.id,
        name: currentProduct.name,
        basePrice: currentProduct.basePrice,
        price: calculateFinalUnitPrice(),
        unit: currentProduct.unit,
        quantity: modalQuantity,
        location: selectedLocation,
        category: currentProduct.category,
        isDeal: false,
        isCustomized: true,
        variants: { ...currentVariantSelection },
        addons: [...currentAddons],
        customText: document.getElementById('customText')?.value || '',
        specialInstructions: document.getElementById('specialInstructions')?.value || ''
    };
    
    // Add to cart
    cart.push(customizedItem);
    
    updateCartDisplay();
    updateQuickCartCount();
    displayProducts();
    saveCartToStorage();
    closeProductModal();
    
    showNotification(`Customized ${currentProduct.name} added to your order!`, 'success');
    
    // Track customized add to cart
    trackEvent('customized_product_added', {
        productId: currentProduct.id,
        productName: currentProduct.name,
        variants: currentVariantSelection,
        addons: currentAddons.map(a => a.id),
        quantity: modalQuantity,
        finalPrice: customizedItem.price,
        location: selectedLocation,
        timestamp: new Date().toISOString()
    });
}

function calculateFinalUnitPrice() {
    let price = currentProduct.basePrice;
    
    Object.values(currentVariantSelection).forEach(variant => {
        price += variant.priceModifier;
    });
    
    currentAddons.forEach(addon => {
        price += addon.price;
    });
    
    return price;
}

function generateCartItemId() {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('productModalOverlay');
    
    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Reset modal state
    currentProduct = null;
    currentVariantSelection = {};
    currentAddons = [];
    modalQuantity = 1;
    
    // Hide all option groups
    document.querySelectorAll('.option-group').forEach(group => {
        if (group.id !== 'specialInstructions') {
            group.style.display = 'none';
        }
    });
}

// =============================================================================
// ENHANCED CART FUNCTIONS
// =============================================================================

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
            cartItems.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
        }
        
        if (cartSummary) {
            cartSummary.style.display = 'block';
            updateCartSummary();
        }
    }
}

function createCartItemHTML(item) {
    const variantText = item.variants ? createVariantDisplayText(item.variants) : '';
    const addonsText = item.addons && item.addons.length > 0 ? 
        `<div class="cart-item-addons">Add-ons: ${item.addons.map(a => a.id).join(', ')}</div>` : '';
    
    return `
        <div class="cart-item ${item.isCustomized ? 'customized' : ''}">
            <div class="cart-item-image">
                <i class="fas ${getProductIcon(item.category)}"></i>
                ${item.isCustomized ? '<div class="custom-indicator"><i class="fas fa-magic"></i></div>' : ''}
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">
                    ${item.name}
                    ${item.isDeal ? '<span class="deal-indicator">DEAL</span>' : ''}
                    ${item.isCustomized ? '<span class="custom-indicator">CUSTOM</span>' : ''}
                </div>
                
                ${variantText ? `<div class="cart-item-variants">${variantText}</div>` : ''}
                ${addonsText}
                ${item.customText ? `<div class="cart-item-custom-text">Message: "${item.customText}"</div>` : ''}
                
                <div class="cart-item-price">
                    ₦${item.price.toLocaleString()}/${item.unit}
                    ${item.originalPrice && item.originalPrice !== item.price ? 
                        `<span class="original-price">₦${item.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                
                <div class="cart-item-controls">
                    ${item.isCustomized ? `
                        <span class="quantity-display">${item.quantity}x</span>
                        <button class="edit-item" onclick="editCartItem('${item.id}')" title="Edit customization">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : `
                        <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                               onchange="setCartItemQuantity('${item.id}', this.value)" min="1">
                        <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    `}
                    <button class="remove-item" onclick="removeFromCart('${item.id}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createVariantDisplayText(variants) {
    return Object.entries(variants).map(([type, variant]) => {
        const variantData = currentProduct?.variants?.[type]?.find(v => v.id === variant.id);
        return variantData ? variantData.name : variant.id;
    }).join(', ');
}

function updateCartItemQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
        removeFromCart(itemId);
    } else {
        item.quantity = newQuantity;
        updateCartDisplay();
        updateQuickCartCount();
        saveCartToStorage();
    }
}

function setCartItemQuantity(itemId, quantity) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item) return;
    
    const newQuantity = parseInt(quantity) || 0;
    if (newQuantity <= 0) {
        removeFromCart(itemId);
    } else {
        item.quantity = newQuantity;
        updateCartDisplay();
        updateQuickCartCount();
        saveCartToStorage();
    }
}

function removeFromCart(itemId) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index > -1) {
        const item = cart[index];
        cart.splice(index, 1);
        showNotification(`Removed ${item.name} from your order`, 'success');
        updateCartDisplay();
        updateQuickCartCount();
        displayProducts();
        saveCartToStorage();
        
        trackEvent('remove_from_cart', {
            itemId: itemId,
            productName: item.name,
            isCustomized: item.isCustomized,
            location: selectedLocation,
            timestamp: new Date().toISOString()
        });
    }
}

function editCartItem(itemId) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (!item || !item.isCustomized) return;
    
    // Find original product
    const product = products.find(p => p.id === item.productId);
    if (!product) return;
    
    // Load existing customization
    currentProduct = product;
    currentVariantSelection = { ...item.variants };
    currentAddons = [...item.addons];
    modalQuantity = item.quantity;
    
    // Remove item from cart temporarily
    removeFromCart(itemId);
    
    // Open customization modal with existing data
    populateProductModal(product);
    
    // Restore previous selections
    restoreVariantSelections();
    restoreAddonSelections();
    
    if (item.customText) {
        document.getElementById('customText').value = item.customText;
    }
    if (item.specialInstructions) {
        document.getElementById('specialInstructions').value = item.specialInstructions;
    }
    
    // Show modal
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('productModalOverlay');
    
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function restoreVariantSelections() {
    Object.entries(currentVariantSelection).forEach(([type, variant]) => {
        const button = document.querySelector(`[data-variant-type="${type}"][data-variant-id="${variant.id}"]`);
        if (button) {
            button.classList.add('selected');
        }
    });
}

function restoreAddonSelections() {
    currentAddons.forEach(addon => {
        const checkbox = document.querySelector(`[data-addon-id="${addon.id}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

// =============================================================================
// ENHANCED CHECKOUT WITH CUSTOMIZATION DATA
// =============================================================================

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
    
    // Enhanced order items with customization details
    orderMessage += `\n*🍽️ Order Items:*\n`;
    cart.forEach((item, index) => {
        orderMessage += `${index + 1}. ${item.name}${item.isDeal ? ' (Deal)' : ''}${item.isCustomized ? ' (Custom)' : ''}\n`;
        orderMessage += `   Quantity: ${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''}\n`;
        orderMessage += `   Price: ₦${item.price.toLocaleString()} each\n`;
        
        // Add customization details
        if (item.isCustomized) {
            if (item.variants && Object.keys(item.variants).length > 0) {
                orderMessage += `   *Customization:*\n`;
                Object.entries(item.variants).forEach(([type, variant]) => {
                    const product = products.find(p => p.id === item.productId);
                    const variantData = product?.variants?.[type]?.find(v => v.id === variant.id);
                    if (variantData) {
                        orderMessage += `   - ${type}: ${variantData.name}\n`;
                    }
                });
            }
            
            if (item.addons && item.addons.length > 0) {
                orderMessage += `   *Add-ons:* ${item.addons.map(a => a.id).join(', ')}\n`;
            }
            
            if (item.customText) {
                orderMessage += `   *Custom Message:* "${item.customText}"\n`;
            }
            
            if (item.specialInstructions) {
                orderMessage += `   *Special Instructions:* ${item.specialInstructions}\n`;
            }
        }
        
        if (item.originalPrice && item.originalPrice !== item.price) {
            orderMessage += `   *You saved: ₦${((item.originalPrice - item.price) * item.quantity).toLocaleString()}!*\n`;
        }
        
        orderMessage += `\n`;
    });
    
    // Order totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currentDeliveryFee = isDeliveryMode && subtotal < freeDeliveryThreshold ? deliveryFee : 0;
    const total = subtotal + currentDeliveryFee;
    
    orderMessage += `*💰 Order Summary:*\n`;
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

// =============================================================================
// NEW FEATURE BANNER
// =============================================================================

function showEnhancementBanner() {
    const banner = document.getElementById('enhancementBanner');
    if (banner && !localStorage.getItem('enhancementBannerDismissed')) {
        setTimeout(() => {
            banner.style.display = 'block';
        }, 2000);
    }
}

function dismissEnhancementBanner() {
    const banner = document.getElementById('enhancementBanner');
    if (banner) {
        banner.style.display = 'none';
    }
    localStorage.setItem('enhancementBannerDismissed', 'true');
}

// =============================================================================
// INITIALIZATION ENHANCEMENTS
// =============================================================================

// Add to your existing initializeApp function
async function initializeApp() {
    showLoadingOverlay();
    
    try {
        console.log('🚀 Initializing Enhanced Naija Bites Customer App...');
        
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
        
        // Show enhancement banner
        showEnhancementBanner();
        
        // Track page load
        trackEvent('page_load', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            hasVariantSupport: true
        });
        
        console.log('✅ Enhanced Naija Bites Customer App Initialized Successfully');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showNotification('Failed to load app. Please refresh the page.', 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// =============================================================================
// GLOBAL EXPORTS (Enhanced)
// =============================================================================

// Export new functions for global access
window.openProductCustomization = openProductCustomization;
window.closeProductModal = closeProductModal;
window.selectVariant = selectVariant;
window.toggleAddon = toggleAddon;
window.updateModalQuantity = updateModalQuantity;
window.addCustomizedToCart = addCustomizedToCart;
window.editCartItem = editCartItem;
window.updateCartItemQuantity = updateCartItemQuantity;
window.setCartItemQuantity = setCartItemQuantity;
window.dismissEnhancementBanner = dismissEnhancementBanner;

// Keep all existing exports
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

console.log('🚀 Enhanced Naija Bites Customer App with Product Variants Loaded Successfully!');

// =============================================================================
// END OF ENHANCED SCRIPT - BATCH 1
// =============================================================================
