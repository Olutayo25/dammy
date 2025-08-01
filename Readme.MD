# 🏗️ **Naija Bites Web App - Complete File Structure Schema**

## 📁 **Root Directory Structure**

    naija-bites/
    ├── 📁 frontend/                    # Customer-facing app
    │   ├── 📁 assets/
    │   │   ├── 📁 images/
    │   │   ├── 📁 icons/
    │   │   └── 📁 fonts/
    │   ├── 📁 css/
    │   │   ├── styles.css              # Main customer styles
    │   │   ├── components.css          # Reusable components
    │   │   └── responsive.css          # Mobile responsiveness
    │   ├── 📁 js/
    │   │   ├── app.js                  # Main app initialization
    │   │   ├── components/
    │   │   │   ├── cart.js             # Cart functionality
    │   │   │   ├── product-modal.js    # Product customization
    │   │   │   ├── cake-builder.js     # Interactive cake builder
    │   │   │   ├── checkout.js         # Checkout process
    │   │   │   └── location-picker.js  # Location selection
    │   │   ├── services/
    │   │   │   ├── api.js              # API communication
    │   │   │   ├── storage.js          # Local storage management
    │   │   │   └── notifications.js    # Push notifications
    │   │   └── utils/
    │   │       ├── helpers.js          # Utility functions
    │   │       ├── validators.js       # Form validation
    │   │       └── constants.js        # App constants
    │   ├── index.html                  # Main customer page
    │   ├── manifest.json               # PWA manifest
    │   └── sw.js                       # Service worker
    │
    ├── 📁 admin/                       # Admin panel
    │   ├── 📁 css/
    │   │   ├── admin.css              # Admin-specific styles
    │   │   └── dashboard.css          # Dashboard layouts
    │   ├── 📁 js/
    │   │   ├── admin.js               # Main admin logic
    │   │   ├── components/
    │   │   │   ├── product-manager.js  # Product CRUD
    │   │   │   ├── location-manager.js # Location management
    │   │   │   ├── deals-manager.js    # Deals & promotions
    │   │   │   ├── config-manager.js   # App configuration
    │   │   │   └── analytics.js        # Dashboard analytics
    │   │   └── services/
    │   │       ├── admin-api.js        # Admin API calls
    │   │       └── data-export.js      # Data export/import
    │   ├── index.html                  # Admin dashboard
    │   ├── login.html                  # Admin authentication
    │   └── 📁 pages/
    │       ├── products.html           # Product management
    │       ├── locations.html          # Location management
    │       ├── deals.html              # Deals management
    │       ├── config.html             # App configuration
    │       └── analytics.html          # Analytics dashboard
    │
    ├── 📁 backend/                     # Node.js/Express backend
    │   ├── 📁 routes/
    │   │   ├── products.js             # Product endpoints
    │   │   ├── locations.js            # Location endpoints
    │   │   ├── deals.js                # Deals endpoints
    │   │   ├── orders.js               # Order processing
    │   │   ├── config.js               # App configuration
    │   │   └── admin.js                # Admin authentication
    │   ├── 📁 models/
    │   │   ├── Product.js              # Product data model
    │   │   ├── Location.js             # Location data model
    │   │   ├── Deal.js                 # Deal data model
    │   │   ├── Order.js                # Order data model
    │   │   └── Config.js               # App configuration model
    │   ├── 📁 middleware/
    │   │   ├── auth.js                 # Authentication
    │   │   ├── validation.js           # Request validation
    │   │   └── cors.js                 # CORS handling
    │   ├── 📁 services/
    │   │   ├── whatsapp.js             # WhatsApp integration
    │   │   ├── notifications.js        # Push notification service
    │   │   └── analytics.js            # Analytics tracking
    │   ├── 📁 data/
    │   │   ├── products.json           # Product data (JSON DB)
    │   │   ├── locations.json          # Location data
    │   │   ├── deals.json              # Active deals
    │   │   ├── config.json             # App configuration
    │   │   └── categories.json         # Product categories
    │   ├── server.js                   # Express server
    │   └── package.json                # Backend dependencies
    │
    ├── 📁 shared/                      # Shared configurations
    │   ├── schemas/
    │   │   ├── product-schema.json     # Product data structure
    │   │   ├── location-schema.json    # Location data structure
    │   │   └── config-schema.json      # App config structure
    │   └── constants/
    │       ├── categories.json         # Product categories
    │       ├── currencies.json         # Supported currencies
    │       └── timezones.json          # Timezone settings
    │
    ├── 📁 docs/                        # Documentation
    │   ├── api-docs.md                 # API documentation
    │   ├── setup-guide.md              # Setup instructions
    │   └── deployment.md               # Deployment guide
    │
    ├── .env                            # Environment variables
    ├── .gitignore                      # Git ignore rules
    ├── README.md                       # Project documentation
    └── package.json                    # Root package.json

## 🎯 **Key Data Schemas**

### **1. App Configuration Schema** (`shared/schemas/config-schema.json`)

``` json
{
  "app": {
    "name": "Naija Bites",
    "tagline": "Authentic Nigerian Food Delivered Fresh",
    "logo": "/assets/images/logo.png",
    "theme": {
      "primaryColor": "#008751",
      "secondaryColor": "#ff6b35"
    }
  },
  "hero": {
    "title": "Authentic Nigerian Food Delivered Fresh",
    "subtitle": "From tasty Jollof rice to hearty Egusi soup",
    "backgroundImage": "/assets/images/hero-bg.jpg",
    "features": [
      { "icon": "fa-motorcycle", "text": "Fast Delivery" },
      { "icon": "fa-fire", "text": "Served Hot" },
      { "icon": "fa-heart", "text": "Authentic Taste" }
    ],
    "cta": {
      "text": "Order Now",
      "action": "scrollToProducts"
    }
  },
  "delivery": {
    "freeDeliveryThreshold": 15000,
    "deliveryFee": 1500,
    "currency": "NGN",
    "currencySymbol": "₦"
  },
  "contact": {
    "phone": "+234 812 345 6000",
    "email": "hello@naijabites.ng",
    "whatsapp": "+234 812 345 6000",
    "hours": "Mon-Sun: 9:00 AM - 11:00 PM"
  },
  "social": {
    "facebook": "https://facebook.com/naijabites",
    "instagram": "https://instagram.com/naijabites",
    "twitter": "https://twitter.com/naijabites"
  },
  "features": {
    "enableDeals": true,
    "enableCustomization": true,
    "enableCakeBuilder": true,
    "enableNotifications": true,
    "enablePWA": true
  }
}
```

### **2. Product Schema** (`shared/schemas/product-schema.json`)

``` json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "basePrice": "number",
  "currency": "string",
  "unit": "string",
  "image": "string",
  "gallery": ["string"],
  "prepTime": "string",
  "isSpicy": "boolean",
  "isPopular": "boolean",
  "isAvailable": "boolean",
  "stock": {
    "locationId": "number"
  },
  "hasVariants": "boolean",
  "variants": {
    "variantType": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "priceModifier": "number",
        "isDefault": "boolean"
      }
    ]
  },
  "isCustomizable": "boolean",
  "customization": {
    "allowCustomText": "boolean",
    "maxTextLength": "number",
    "allowColorChoice": "boolean",
    "availableColors": ["string"]
  },
  "addons": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "isAvailable": "boolean"
    }
  ],
  "nutritionInfo": {
    "calories": "number",
    "protein": "string",
    "allergens": ["string"]
  },
  "tags": ["string"],
  "popularity": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### **3. Location Schema** (`shared/schemas/location-schema.json`)

``` json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "operatingHours": {
    "monday": { "open": "09:00", "close": "23:00" },
    "tuesday": { "open": "09:00", "close": "23:00" }
  },
  "deliveryZones": [
    {
      "name": "string",
      "radius": "number",
      "fee": "number"
    }
  ],
  "isActive": "boolean",
  "features": {
    "hasDelivery": "boolean",
    "hasPickup": "boolean",
    "acceptsOnlineOrders": "boolean"
  },
  "staff": {
    "manager": "string",
    "phone": "string"
  },
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 🔄 **File Rewriting Priority Order**

### **Phase 1: Core Configuration** (Start Here)

1.  `shared/schemas/config-schema.json` - App configuration structure
2.  `backend/data/config.json` - Default app configuration
3.  `backend/routes/config.js` - Configuration API endpoint

### **Phase 2: Backend Foundation**

1.  `backend/server.js` - Express server setup
2.  `backend/routes/products.js` - Products API
3.  `backend/routes/locations.js` - Locations API
4.  `backend/data/products.json` - Dynamic product data
5.  `backend/data/locations.json` - Dynamic location data

### **Phase 3: Frontend Core**

1.  `frontend/js/services/api.js` - API service layer
2.  `frontend/js/utils/constants.js` - Dynamic constants
3.  `frontend/js/app.js` - Main app initialization
4.  `frontend/index.html` - Dynamic HTML structure

### **Phase 4: Frontend Components**

1.  `frontend/js/components/product-modal.js` - Dynamic product
    customization
2.  `frontend/js/components/cake-builder.js` - Dynamic cake builder
3.  `frontend/js/components/cart.js` - Enhanced cart functionality
4.  `frontend/js/components/checkout.js` - Dynamic checkout

### **Phase 5: Admin Panel**

1.  `admin/js/components/config-manager.js` - Configuration management
2.  `admin/js/components/product-manager.js` - Product management
3.  `admin/index.html` - Admin dashboard

### **Phase 6: Enhancement**

1.  `frontend/css/styles.css` - Dynamic theming
2.  `frontend/manifest.json` - PWA configuration
3.  `backend/services/whatsapp.js` - Order integration

## 🎯 **Key Benefits of This Structure**

1.  **Complete Separation of Concerns** - Frontend, backend, admin, and
    configuration are isolated
2.  **Dynamic Everything** - No hardcoded content anywhere
3.  **Scalable** - Easy to add new features, locations, or product types
4.  **Maintainable** - Clear file organization and responsibilities
5.  **Backend-Driven** - Admin can control everything without code
    changes
6.  **Future-Proof** - Easy to add new features or change requirements
