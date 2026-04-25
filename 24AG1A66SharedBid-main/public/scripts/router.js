// Simple router for SPA
const Router = {
  routes: {
    '/': 'pages/index.html',
    '/login': 'pages/login.html',
    '/register': 'pages/register.html',
    '/bidder': 'pages/bidder.html',
    '/seller': 'pages/seller.html',
    '/product': 'pages/product-detail.html',
    '/dashboard': 'pages/dashboard.html',
    '/404': 'pages/404.html'
  },
  
  // Initialize the router
  init() {
    console.log('Router initializing...');
    // Initial route
    this.navigate(window.location.hash || '#/');
    
    // Listen for hashchange events
    window.addEventListener('hashchange', () => {
      this.navigate(window.location.hash);
    });
    
    console.log('Router initialized');
  },
  
  // Navigate to a route
  navigate(hash) {
    console.log('Navigating to:', hash);
    const route = this.getRoute(hash);
    this.loadContent(route);
  },
  
  // Get the route path based on hash
  getRoute(hash) {
    if (!hash || hash === '#' || hash === '#/') {
      return this.routes['/'];
    }
    
    // Extract path from hash (e.g., '#/login' becomes '/login')
    const path = hash.substring(1);
    
    // Handle dynamic routes (e.g., '/product/:id')
    if (path.startsWith('/product/')) {
      return this.routes['/product'];
    }
    
    // Check if route exists
    if (this.routes[path]) {
      return this.routes[path];
    }
    
    // Return 404 page if route not found
    return this.routes['/404'];
  },
  
  // Load content for a route
  loadContent(route) {
    fetch(route)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        document.getElementById('app').innerHTML = html;
        this.afterRouteLoad(route);
      })
      .catch(error => {
        console.error('Error loading route:', error);
        document.getElementById('app').innerHTML = '<div class="error">Error loading content</div>';
      });
  },
  
  // Actions to perform after route is loaded
  afterRouteLoad(route) {
    console.log('Route loaded:', route);
    const currentUser = AuthService.getCurrentUser();
    
    // Create navbar if user is logged in
    if (currentUser && !document.querySelector('.navbar')) {
      const navbar = createNavbar(currentUser);
      document.body.insertBefore(navbar, document.getElementById('app'));
    }
    
    // Route-specific actions
    if (route === this.routes['/bidder']) {
      this.loadBidderPage();
    } else if (route === this.routes['/seller']) {
      this.loadSellerPage();
    } else if (route === this.routes['/product']) {
      this.loadProductDetail();
    } else if (route === this.routes['/dashboard']) {
      this.loadDashboardPage();
    }
    
    // Protect authenticated routes
    this.protectRoutes(route);
  },
  
  // Redirect if trying to access protected routes without authentication
  protectRoutes(route) {
    const publicRoutes = [
      this.routes['/'],
      this.routes['/login'],
      this.routes['/register'],
      this.routes['/404']
    ];
    
    const isAuthenticated = AuthService.isAuthenticated();
    
    // Redirect to login if trying to access protected routes without auth
    if (!isAuthenticated && !publicRoutes.includes(route)) {
      window.location.hash = '#/login';
    }
  },
  
  // Load bidder page content
  loadBidderPage() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'bidder') {
      window.location.hash = '#/login';
      return;
    }
    
    document.querySelector('.bidder-page').innerHTML = `
      <div class="container dashboard">
        <div class="dashboard-header">
          <div>
            <h1>Welcome, ${currentUser.name}</h1>
            <p class="sub-title">Find and bid on your favorite items</p>
          </div>
          <a href="#/dashboard" class="btn btn-primary">View My Dashboard</a>
        </div>
        
        <div class="search-filters">
          <input type="text" id="search-input" class="form-input" placeholder="Search products...">
          <select id="price-filter" class="form-input">
            <option value="all">All Prices</option>
            <option value="0-500">Under $500</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000-5000">$1,000 - $5,000</option>
            <option value="5000">Over $5,000</option>
          </select>
          <select id="category-filter" class="form-input">
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Art">Art</option>
            <option value="Collectibles">Collectibles</option>
          </select>
        </div>
        
        <div class="tab-buttons">
          <button class="tab-button active" data-tab="all">All Listings</button>
          <button class="tab-button" data-tab="collaborative">Collaborative Bidding</button>
        </div>
        
        <div class="tab-content" id="all-listings-tab">
          <div class="product-grid" id="product-grid">
            <!-- Products will be loaded here -->
            <div class="loading">Loading products...</div>
          </div>
        </div>
        
        <div class="tab-content" id="collaborative-tab" style="display: none;">
          <div class="product-grid" id="collaborative-grid">
            <!-- Collaborative products will be loaded here -->
          </div>
        </div>
      </div>
    `;
    
    // Load products
    this.loadProducts();
    
    // Set up event listeners
    document.getElementById('search-input').addEventListener('input', this.filterProducts);
    document.getElementById('price-filter').addEventListener('change', this.filterProducts);
    document.getElementById('category-filter').addEventListener('change', this.filterProducts);
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show selected tab content
        const tabId = e.target.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        document.getElementById(`${tabId}-tab`).style.display = 'block';
        
        // Reload products if switching to collaborative tab
        if (tabId === 'collaborative') {
          this.loadCollaborativeProducts();
        }
      });
    });
  },
  
  // Load seller page content
  loadSellerPage() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'seller') {
      window.location.hash = '#/login';
      return;
    }
    
    // Get seller's products
    const sellerProducts = ProductService.getSellerProducts(currentUser.id);
    const activeProducts = sellerProducts.filter(p => p.status === 'active');
    const soldProducts = sellerProducts.filter(p => p.status === 'sold');
    
    // Calculate stats
    const totalSales = soldProducts.reduce((sum, p) => sum + p.currentBid, 0);
    const totalBids = sellerProducts.reduce((sum, p) => sum + p.bidsCount, 0);
    const averageBidAmount = totalBids > 0 ? 
      sellerProducts.reduce((sum, p) => sum + p.currentBid, 0) / sellerProducts.length : 0;
    
    document.querySelector('.seller-page').innerHTML = `
      <div class="container dashboard">
        <div class="dashboard-header">
          <div>
            <h1>Seller Dashboard</h1>
            <p class="sub-title">Manage your listings and track sales</p>
          </div>
          <div>
            <a href="#/dashboard" class="btn btn-outline">Full Dashboard</a>
            <button id="list-item-btn" class="btn btn-primary">List New Item</button>
          </div>
        </div>
        
        <div class="stats-grid">
          ${createStatCard('Active Listings', activeProducts.length, 'Current listings')}
          ${createStatCard('Total Sales', formatCurrency(totalSales), `From ${soldProducts.length} sold items`)}
          ${createStatCard('Total Bids', totalBids, `Avg ${formatCurrency(averageBidAmount)} per item`)}
        </div>
        
        <div class="tab-buttons">
          <button class="tab-button active" data-tab="active">Active Listings</button>
          <button class="tab-button" data-tab="sold">Sold Items</button>
        </div>
        
        <div class="tab-content" id="active-tab">
          <div class="product-grid" id="active-products">
            ${activeProducts.length > 0 ? 
              activeProducts.map(product => createProductCard(product)).join('') : 
              `<div class="empty-state">
                <h3>No Active Listings</h3>
                <p>You don't have any active listings at the moment.</p>
                <button id="create-listing-btn" class="btn btn-primary">List an Item</button>
              </div>`
            }
          </div>
        </div>
        
        <div class="tab-content" id="sold-tab" style="display: none;">
          <div class="product-grid" id="sold-products">
            ${soldProducts.length > 0 ? 
              soldProducts.map(product => createProductCard(product)).join('') : 
              `<div class="empty-state">
                <h3>No Sold Items</h3>
                <p>You haven't sold any items yet.</p>
              </div>`
            }
          </div>
        </div>
      </div>
    `;
    
    // Create new listing modal
    createModal('new-listing-modal', 'List a New Item', `
      <form id="new-listing-form">
        <div class="form-group">
          <label class="form-label" for="title">Title</label>
          <input class="form-input" type="text" id="title" required>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="description">Description</label>
          <textarea class="form-input" id="description" rows="3" required></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="imageUrl">Image URL</label>
          <input class="form-input" type="url" id="imageUrl" required placeholder="https://example.com/image.jpg">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="basePrice">Base Price ($)</label>
          <input class="form-input" type="number" id="basePrice" min="1" step="1" required>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="category">Category</label>
          <select class="form-input" id="category" required>
            <option value="">Select a category</option>
            <option value="Electronics">Electronics</option>
            <option value="Art">Art</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Accessories">Accessories</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="condition">Condition</label>
          <select class="form-input" id="condition" required>
            <option value="">Select condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Vintage">Vintage</option>
          </select>
        </div>
      </form>
    `, () => {
      const form = document.getElementById('new-listing-form');
      const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        imageUrl: document.getElementById('imageUrl').value,
        basePrice: parseFloat(document.getElementById('basePrice').value),
        category: document.getElementById('category').value,
        condition: document.getElementById('condition').value,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        endTime: new Date(Date.now() + 604800000).toISOString() // 7 days from now
      };
      
      ProductService.createProduct(formData)
        .then(product => {
          closeModal('new-listing-modal');
          showToast('Product listed successfully');
          
          // Reload the page to show the new listing
          window.location.reload();
        })
        .catch(error => {
          showToast(error.message, 'error');
        });
    });
    
    // Set up event listeners
    document.getElementById('list-item-btn').addEventListener('click', () => {
      openModal('new-listing-modal');
    });
    
    if (document.getElementById('create-listing-btn')) {
      document.getElementById('create-listing-btn').addEventListener('click', () => {
        openModal('new-listing-modal');
      });
    }
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show selected tab content
        const tabId = e.target.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        document.getElementById(`${tabId}-tab`).style.display = 'block';
      });
    });
  },
  
  // Load dashboard page content
  loadDashboardPage() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      window.location.hash = '#/login';
      return;
    }
    
    // Load dashboard content based on user role
    document.getElementById('app').innerHTML = `
      <div class="container dashboard">
        <h1>Your Dashboard</h1>
        
        <div class="tab-buttons">
          <button class="tab-button ${currentUser.role === 'bidder' ? 'active' : ''}" data-tab="bidder">Bidder Dashboard</button>
          <button class="tab-button ${currentUser.role === 'seller' ? 'active' : ''}" data-tab="seller">Seller Dashboard</button>
        </div>
        
        <div id="bidder-tab" class="tab-content" style="display: ${currentUser.role === 'bidder' ? 'block' : 'none'}">
          <!-- Bidder dashboard content will be loaded here -->
        </div>
        
        <div id="seller-tab" class="tab-content" style="display: ${currentUser.role === 'seller' ? 'block' : 'none'}">
          <!-- Seller dashboard content will be loaded here -->
        </div>
      </div>
    `;
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const tabId = e.target.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        document.getElementById(`${tabId}-tab`).style.display = 'block';
        
        if (tabId === 'bidder') {
          this.loadBidderDashboard();
        } else {
          this.loadSellerDashboard();
        }
      });
    });
    
    // Load initial tab content
    if (currentUser.role === 'bidder') {
      this.loadBidderDashboard();
    } else {
      this.loadSellerDashboard();
    }
  },
  
  // Load bidder dashboard content
  loadBidderDashboard() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;
    
    const userBids = ProductService.getBidderBids(currentUser.id);
    const products = ProductService.getAllProducts();
    const biddedProductIds = [...new Set(userBids.map(bid => bid.productId))];
    const biddedProducts = products.filter(p => biddedProductIds.includes(p.id));
    
    const wonBids = biddedProducts.filter(p => {
      if (p.status !== 'sold') return false;
      const highestBid = userBids
        .filter(b => b.productId === p.id)
        .sort((a, b) => b.amount - a.amount)[0];
      return highestBid && highestBid.amount === p.currentBid;
    });
    
    const userCollaborativeBids = ProductService.getUserCollaborativeBids(currentUser.id);
    
    // Calculate stats
    const bidderStats = {
      participatedBids: userBids.length,
      wonBids: wonBids.length,
      activeCollaborations: userCollaborativeBids.filter(cb => cb.status === 'forming' || cb.status === 'active').length,
      totalSpent: wonBids.reduce((sum, p) => sum + p.currentBid, 0)
    };
    
    document.getElementById('bidder-tab').innerHTML = `
      <div class="stats-grid">
        ${createStatCard('Bids Placed', bidderStats.participatedBids, 'Total bids you\'ve made')}
        ${createStatCard('Auctions Won', bidderStats.wonBids, 'Items you\'ve successfully won')}
        ${createStatCard('Active Collaborations', bidderStats.activeCollaborations, 'Group bids you\'re participating in')}
        ${createStatCard('Total Spent', formatCurrency(bidderStats.totalSpent), 'On won auctions')}
      </div>
      
      <div class="dashboard-section">
        <h2>My Bids</h2>
        <div class="bid-history">
          ${userBids.length > 0 ? 
            userBids
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map(bid => {
                const product = products.find(p => p.id === bid.productId);
                return `
                  <div class="bid-record">
                    <div class="bid-product">
                      <img src="${product?.imageUrl}" alt="${product?.title}" class="bid-product-image">
                      <div class="bid-details">
                        <h3><a href="#/product/${bid.productId}">${product?.title || 'Unknown Product'}</a></h3>
                        <div class="bid-meta">
                          <span>${formatCurrency(bid.amount)}</span>
                          <span>${formatRelativeTime(bid.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div class="bid-status">
                      ${bid.amount === product?.currentBid 
                        ? '<span class="badge badge-success">Highest Bid</span>' 
                        : '<span class="badge badge-info">Outbid</span>'}
                    </div>
                  </div>
                `;
              }).join('') : 
            `<div class="empty-state">
              <p>You haven't placed any bids yet.</p>
              <a href="#/bidder" class="btn btn-primary">Browse Listings</a>
            </div>`
          }
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Collaborative Bids</h2>
        <div class="collaborative-bids">
          ${userCollaborativeBids.length > 0 ? 
            userCollaborativeBids.map(collab => {
              const product = products.find(p => p.id === collab.productId);
              if (!product) return '';
              
              const userContribution = collab.participants.find(
                p => p.userId === currentUser.id
              )?.contributionAmount || 0;
              
              const percentageFunded = Math.round((collab.totalAmount / product.currentBid) * 100);
              
              return `
                <div class="collaborative-item">
                  <div class="collab-product">
                    <img src="${product.imageUrl}" alt="${product.title}" class="collab-image">
                    <div class="collab-details">
                      <h3><a href="#/product/${product.id}">${product.title}</a></h3>
                      <div class="collab-meta">
                        <span>Your contribution: ${formatCurrency(userContribution)}</span>
                        <span>${collab.participantCount} participants</span>
                      </div>
                    </div>
                  </div>
                  <div class="collab-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${percentageFunded}%"></div>
                    </div>
                    <div class="progress-meta">
                      <span>${percentageFunded}% funded</span>
                      <span>Target: ${formatCurrency(product.currentBid)}</span>
                    </div>
                    <span class="badge ${
                      collab.status === 'forming' ? 'badge-warning' :
                      collab.status === 'active' ? 'badge-success' :
                      collab.status === 'won' ? 'badge-primary' :
                      'badge-danger'
                    }">${collab.status}</span>
                  </div>
                </div>
              `;
            }).join('') : 
            `<div class="empty-state">
              <p>You're not participating in any collaborative bids.</p>
              <a href="#/bidder" class="btn btn-primary">Explore Collaborative Listings</a>
            </div>`
          }
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Items Won</h2>
        <div class="product-grid">
          ${wonBids.length > 0 ? 
            wonBids.map(product => createProductCard(product)).join('') : 
            `<div class="empty-state">
              <p>You haven't won any auctions yet. Keep bidding!</p>
              <a href="#/bidder" class="btn btn-primary">Browse Listings</a>
            </div>`
          }
        </div>
      </div>
    `;
  },
  
  // Load seller dashboard content
  loadSellerDashboard() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;
    
    const sellerProducts = ProductService.getSellerProducts(currentUser.id);
    const activeProducts = sellerProducts.filter(p => p.status === 'active');
    const soldProducts = sellerProducts.filter(p => p.status === 'sold');
    
    // Calculate stats
    const sellerStats = {
      totalSales: soldProducts.reduce((sum, p) => sum + p.currentBid, 0),
      activeListings: activeProducts.length,
      totalBids: sellerProducts.reduce((sum, p) => sum + p.bidsCount, 0),
      averageBidPrice: sellerProducts.length > 0 ? 
        sellerProducts.reduce((sum, p) => sum + p.currentBid, 0) / sellerProducts.length :
        0
    };
    
    document.getElementById('seller-tab').innerHTML = `
      <div class="stats-grid">
        ${createStatCard('Total Sales', formatCurrency(sellerStats.totalSales), `From ${soldProducts.length} items`)}
        ${createStatCard('Active Listings', sellerStats.activeListings, 'Currently available for bidding')}
        ${createStatCard('Total Bids', sellerStats.totalBids, 'Across all your items')}
        ${createStatCard('Avg. Bid Price', formatCurrency(sellerStats.averageBidPrice), 'Per item average')}
      </div>
      
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Active Listings</h2>
          <a href="#/seller" class="btn btn-primary">Add New Listing</a>
        </div>
        <div class="product-grid">
          ${activeProducts.length > 0 ? 
            activeProducts.map(product => createProductCard(product)).join('') : 
            `<div class="empty-state">
              <p>You don't have any active listings. Create a new listing to start selling!</p>
              <a href="#/seller" class="btn btn-primary">Create Listing</a>
            </div>`
          }
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Recent Sales</h2>
        <div class="product-grid">
          ${soldProducts.length > 0 ? 
            soldProducts.map(product => createProductCard(product)).join('') : 
            `<div class="empty-state">
              <p>You haven't sold any items yet.</p>
            </div>`
          }
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Sales Performance</h2>
        <div class="performance-charts">
          <div class="chart-section">
            <h3>Popular Categories</h3>
            <div class="category-stats">
              ${Array.from(new Set(sellerProducts.map(p => p.category))).map(category => {
                const count = sellerProducts.filter(p => p.category === category).length;
                const percentage = Math.round((count / sellerProducts.length) * 100);
                
                return `
                  <div class="category-item">
                    <div class="category-meta">
                      <span>${category}</span>
                      <span>${count} items (${percentage}%)</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="chart-section">
            <h3>Recent Activity</h3>
            <div class="activity-feed">
              ${sellerProducts.slice(0, 3).map(product => `
                <div class="activity-item">
                  <div class="activity-content">
                    <h4>${product.title}</h4>
                    <p>${product.status === 'active' ? 'Ends' : 'Ended'} ${formatTimeRemaining(product.endTime)}</p>
                  </div>
                  <div class="activity-meta">
                    <span>${formatCurrency(product.currentBid)}</span>
                    <span>${product.bidsCount} bids</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // Load product detail page
  loadProductDetail() {
    const productId = window.location.hash.split('/')[2];
    if (!productId) {
      window.location.hash = '#/404';
      return;
    }
    
    const product = ProductService.getProduct(productId);
    if (!product) {
      window.location.hash = '#/404';
      return;
    }
    
    const currentUser = AuthService.getCurrentUser();
    const productBids = ProductService.getProductBids(productId);
    const minBid = product.currentBid + 1;
    const endTime = new Date(product.endTime);
    const isExpired = endTime < new Date();
    
    // Check if user can bid
    const canBid = currentUser && 
                 currentUser.role === 'bidder' && 
                 !isExpired && 
                 currentUser.id !== product.sellerId;
    
    // Check if user has bid on this product
    const userHasBid = currentUser && 
                     productBids.some(bid => bid.bidderId === currentUser.id);
    
    document.getElementById('app').innerHTML = `
      <div class="container product-detail">
        <div class="back-link">
          <a href="${currentUser?.role === 'seller' ? '#/seller' : '#/bidder'}" class="btn btn-link">&larr; Back to listings</a>
        </div>
        
        <div class="product-detail-grid">
          <div class="product-main">
            <div class="product-image-container">
              <img src="${product.imageUrl}" alt="${product.title}" class="product-image-large">
              ${isExpired ? '<span class="badge badge-danger" style="position: absolute; top: 16px; right: 16px;">Auction Ended</span>' : ''}
              ${product.collaborativeBidding ? '<span class="badge badge-primary" style="position: absolute; top: 16px; left: 16px;">Collaborative Bidding</span>' : ''}
            </div>
            
            <div class="product-info-main">
              <div class="product-detail-header">
                <div>
                  <h1 class="product-detail-title">${product.title}</h1>
                  <p class="product-detail-meta">
                    Listed by ${product.sellerName} • ${product.category} • ${product.condition}
                  </p>
                </div>
                <div class="product-price-large">
                  <div class="current-price">${formatCurrency(product.currentBid)}</div>
                  <div class="bids-count">${product.bidsCount} bids</div>
                </div>
              </div>
              
              <div class="time-remaining ${isExpired ? 'expired' : ''}">
                ${formatTimeRemaining(product.endTime)}
              </div>
              
              <div class="product-tabs">
                <div class="tab-buttons">
                  <button class="tab-button active" data-tab="details">Details</button>
                  <button class="tab-button" data-tab="bidding">Bidding History</button>
                </div>
                
                <div class="tab-content" id="details-tab">
                  <div class="product-description-full">
                    <h3>Description</h3>
                    <p>${product.description}</p>
                  </div>
                  
                  <div class="product-specs">
                    <div>
                      <h3>Base Price</h3>
                      <p>${formatCurrency(product.basePrice)}</p>
                    </div>
                    <div>
                      <h3>Current Bid</h3>
                      <p>${formatCurrency(product.currentBid)}</p>
                    </div>
                  </div>
                </div>
                
                <div class="tab-content" id="bidding-tab" style="display: none;">
                  <div class="bidding-history">
                    ${productBids.length > 0 ? 
                      productBids
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map(bid => createBidHistoryItem(bid)).join('') : 
                      '<p>No bids have been placed yet.</p>'
                    }
                  </div>
                </div>
              </div>
              
              <div class="product-actions">
                ${canBid ? `
                  <div class="action-buttons">
                    <button id="place-bid-btn" class="btn btn-primary">Place Bid</button>
                    ${!product.collaborativeBidding ? 
                      `<button id="start-collab-btn" class="btn btn-outline">Start Collaborative Bid</button>` : 
                      ''
                    }
                  </div>
                ` : `
                  ${!currentUser ? `
                    <a href="#/login" class="btn btn-primary btn-block">Login to Bid</a>
                  ` : isExpired ? `
                    <div class="notice-box">
                      <p>This auction has ended</p>
                    </div>
                  ` : currentUser.role === 'seller' ? `
                    <div class="notice-box">
                      <p>Sellers cannot bid on items</p>
                    </div>
                  ` : ''}
                `}
              </div>
            </div>
          </div>
          
          <div class="product-sidebar">
            <div class="bid-info-card">
              <h3>Bid Information</h3>
              
              <div class="bid-info">
                <span>Current Bid:</span>
                <span class="value">${formatCurrency(product.currentBid)}</span>
              </div>
              
              <div class="bid-info">
                <span>Minimum Bid:</span>
                <span>${formatCurrency(minBid)}</span>
              </div>
              
              <div class="bid-info">
                <span>Total Bids:</span>
                <span>${product.bidsCount}</span>
              </div>
              
              <div class="bid-info">
                <span>Time Remaining:</span>
                <span class="${isExpired ? 'expired' : 'time-remaining'}">${formatTimeRemaining(product.endTime)}</span>
              </div>
              
              ${userHasBid ? `
                <div class="user-bid-status">
                  <p>You have placed bids on this item</p>
                </div>
              ` : ''}
            </div>
            
            ${product.collaborativeBidding ? `
              <div class="collaborative-card">
                <h3>Collaborative Bidding</h3>
                <p>Join forces with other bidders to win this auction</p>
                
                <div class="collab-progress">
                  <div class="progress-meta">
                    <span>Current Total:</span>
                    <span>${formatCurrency(product.collaborativeBidding.totalAmount)}</span>
                  </div>
                  
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, Math.round((product.collaborativeBidding.totalAmount / product.currentBid) * 100))}%"></div>
                  </div>
                  
                  <div class="progress-meta">
                    <span>${Math.round((product.collaborativeBidding.totalAmount / product.currentBid) * 100)}% funded</span>
                  </div>
                </div>
                
                <div class="collab-info">
                  <div class="collab-meta">
                    <span>Participants:</span>
                    <span>${product.collaborativeBidding.participantCount}</span>
                  </div>
                  
                  <div class="collab-meta">
                    <span>Still Needed:</span>
                    <span>${formatCurrency(Math.max(0, product.currentBid - product.collaborativeBidding.totalAmount))}</span>
                  </div>
                </div>
                
                <div class="collaborators">
                  ${product.collaborativeBidding.participants.slice(0, 5).map(p => `
                    <div class="collaborator" title="${p.userName}">${p.userName.charAt(0)}</div>
                  `).join('')}
                  ${product.collaborativeBidding.participantCount > 5 ? `
                    <div class="collaborator">+${product.collaborativeBidding.participantCount - 5}</div>
                  ` : ''}
                </div>
                
                ${canBid ? `
                  <button id="join-collab-btn" class="btn btn-primary btn-block">Join Collaborative Bid</button>
                ` : ''}
              </div>
            ` : ''}
            
            <div class="related-items">
              <h3>More from this seller</h3>
              <div class="related-products">
                ${ProductService.getSellerProducts(product.sellerId)
                  .filter(p => p.id !== product.id)
                  .slice(0, 3)
                  .map(related => `
                    <a href="#/product/${related.id}" class="related-product">
                      <img src="${related.imageUrl}" alt="${related.title}" class="related-product-image">
                      <div class="related-product-info">
                        <h4>${related.title}</h4>
                        <p>${formatCurrency(related.currentBid)}</p>
                      </div>
                    </a>
                  `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const tabId = e.target.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        document.getElementById(`${tabId}-tab`).style.display = 'block';
      });
    });
    
    // Create bid modal
    if (canBid) {
      createModal('place-bid-modal', 'Place a Bid', `
        <div class="form-group">
          <label class="form-label" for="bid-amount">Bid Amount ($)</label>
          <input class="form-input" type="number" id="bid-amount" min="${minBid}" step="1" value="${minBid}">
        </div>
        
        <div class="bid-info">
          <span>Current bid:</span>
          <span>${formatCurrency(product.currentBid)}</span>
        </div>
        
        <div class="bid-info">
          <span>Minimum bid:</span>
          <span>${formatCurrency(minBid)}</span>
        </div>
      `, () => {
        const bidAmount = parseInt(document.getElementById('bid-amount').value);
        
        if (bidAmount < minBid) {
          showToast('Bid amount must be at least ' + formatCurrency(minBid), 'error');
          return;
        }
        
        ProductService.placeBid(product.id, currentUser.id, currentUser.name, bidAmount)
          .then(bid => {
            closeModal('place-bid-modal');
            showToast('Bid placed successfully!');
            
            // Reload the page to show the updated bid
            window.location.reload();
          })
          .catch(error => {
            showToast(error.message, 'error');
          });
      });
      
      // Collaborative bidding modals
      if (!product.collaborativeBidding) {
        createModal('start-collab-modal', 'Start Collaborative Bid', `
          <p>Start a collaborative bid to share ownership with other bidders</p>
          
          <div class="form-group">
            <label class="form-label" for="collab-amount">Your Contribution ($)</label>
            <input class="form-input" type="number" id="collab-amount" min="1" step="1" value="10">
          </div>
        `, () => {
          const collabAmount = parseInt(document.getElementById('collab-amount').value);
          
          if (collabAmount < 1) {
            showToast('Contribution must be at least $1', 'error');
            return;
          }
          
          ProductService.createCollaborativeBid(product.id, currentUser.id, currentUser.name, collabAmount)
            .then(collab => {
              closeModal('start-collab-modal');
              showToast('Collaborative bid started successfully!');
              
              // Reload the page to show the collaborative bid
              window.location.reload();
            })
            .catch(error => {
              showToast(error.message, 'error');
            });
        });
        
        document.getElementById('start-collab-btn')?.addEventListener('click', () => {
          openModal('start-collab-modal');
        });
      } else {
        createModal('join-collab-modal', 'Join Collaborative Bid', `
          <p>Join others to bid collaboratively on this item</p>
          
          <div class="form-group">
            <label class="form-label" for="join-collab-amount">Your Contribution ($)</label>
            <input class="form-input" type="number" id="join-collab-amount" min="1" step="1" value="10">
          </div>
          
          <div class="collab-stats">
            <div class="collab-info">
              <span>Current Total:</span>
              <span>${formatCurrency(product.collaborativeBidding.totalAmount)}</span>
            </div>
            
            <div class="collab-info">
              <span>Target Amount:</span>
              <span>${formatCurrency(product.currentBid)}</span>
            </div>
            
            <div class="collab-info">
              <span>Still Needed:</span>
              <span>${formatCurrency(Math.max(0, product.currentBid - product.collaborativeBidding.totalAmount))}</span>
            </div>
          </div>
        `, () => {
          const joinAmount = parseInt(document.getElementById('join-collab-amount').value);
          
          if (joinAmount < 1) {
            showToast('Contribution must be at least $1', 'error');
            return;
          }
          
          ProductService.joinCollaborativeBid(product.id, currentUser.id, currentUser.name, joinAmount)
            .then(collab => {
              closeModal('join-collab-modal');
              showToast('Joined collaborative bid successfully!');
              
              // Reload the page to show the updated collaborative bid
              window.location.reload();
            })
            .catch(error => {
              showToast(error.message, 'error');
            });
        });
        
        document.getElementById('join-collab-btn')?.addEventListener('click', () => {
          openModal('join-collab-modal');
        });
      }
      
      // Place bid button event listener
      document.getElementById('place-bid-btn')?.addEventListener('click', () => {
        openModal('place-bid-modal');
      });
    }
  },
  
  // Load products for bidder page
  loadProducts() {
    const products = ProductService.getAllProducts().filter(p => p.status === 'active');
    
    if (products.length === 0) {
      document.getElementById('product-grid').innerHTML = `
        <div class="empty-state">
          <p>No active listings available at the moment.</p>
          <p>Check back later for new items!</p>
        </div>
      `;
      return;
    }
    
    const productHtml = products.map(product => createProductCard(product)).join('');
    document.getElementById('product-grid').innerHTML = productHtml;
    
    // Load collaborative products
    this.loadCollaborativeProducts();
  },
  
  // Load collaborative products
  loadCollaborativeProducts() {
    const products = ProductService.getAllProducts()
      .filter(p => p.status === 'active' && p.collaborativeBidding);
    
    const grid = document.getElementById('collaborative-grid');
    if (!grid) return;
    
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No collaborative listings available</h3>
          <p>Collaborative bidding allows you to join forces with other bidders on high-value items.</p>
        </div>
      `;
      return;
    }
    
    const productHtml = products.map(product => createProductCard(product)).join('');
    grid.innerHTML = productHtml;
  },
  
  // Filter products based on search and filters
  filterProducts() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const priceFilter = document.getElementById('price-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    const products = ProductService.getAllProducts().filter(product => {
      // Filter by status (always show active products)
      if (product.status !== 'active') return false;
      
      // Filter by search query
      if (
        searchQuery &&
        !product.title.toLowerCase().includes(searchQuery) &&
        !product.description.toLowerCase().includes(searchQuery)
      ) {
        return false;
      }
      
      // Filter by price range
      if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-').map(Number);
        if (max && (product.currentBid < min || product.currentBid > max)) return false;
        if (!max && product.currentBid < min) return false;
      }
      
      // Filter by category
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }
      
      return true;
    });
    
    // Update regular products
    const productGrid = document.getElementById('product-grid');
    if (products.length === 0) {
      productGrid.innerHTML = `
        <div class="empty-state">
          <p>No products match your search criteria.</p>
          <button class="btn btn-outline" onclick="document.getElementById('search-input').value = ''; document.getElementById('price-filter').value = 'all'; document.getElementById('category-filter').value = 'all'; Router.filterProducts();">Clear Filters</button>
        </div>
      `;
    } else {
      productGrid.innerHTML = products.map(product => createProductCard(product)).join('');
    }
    
    // Update collaborative products
    const collaborativeProducts = products.filter(p => p.collaborativeBidding);
    const collaborativeGrid = document.getElementById('collaborative-grid');
    if (collaborativeGrid) {
      if (collaborativeProducts.length === 0) {
        collaborativeGrid.innerHTML = `
          <div class="empty-state">
            <p>No collaborative products match your search criteria.</p>
          </div>
        `;
      } else {
        collaborativeGrid.innerHTML = collaborativeProducts.map(product => createProductCard(product)).join('');
      }
    }
  }
};

// Helper function to create navbar
function createNavbar(user) {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  
  const container = document.createElement('div');
  container.className = 'container navbar-content';
  
  // Logo
  const logoLink = document.createElement('a');
  logoLink.href = '#/';
  logoLink.className = 'logo';
  
  const logoIcon = document.createElement('div');
  logoIcon.className = 'logo-icon';
  logoIcon.textContent = 'SB';
  
  logoLink.appendChild(logoIcon);
  logoLink.appendChild(document.createTextNode('SharedBid'));
  
  // Navigation links
  const nav = document.createElement('div');
  nav.className = 'nav-links';
  
  if (user) {
    // Home link based on user role
    const homeLink = document.createElement('a');
    homeLink.href = user.role === 'seller' ? '#/seller' : '#/bidder';
    homeLink.textContent = 'Home';
    homeLink.className = 'btn btn-outline';
    nav.appendChild(homeLink);
    
    // Profile/logout dropdown
    const profileButton = document.createElement('button');
    profileButton.className = 'btn btn-outline';
    profileButton.textContent = user.name;
    profileButton.addEventListener('click', () => {
      AuthService.logout();
    });
    nav.appendChild(profileButton);
  } else {
    // Login/register links for logged out users
    const loginLink = document.createElement('a');
    loginLink.href = '#/login';
    loginLink.textContent = 'Login';
    loginLink.className = 'btn btn-outline';
    
    const registerLink = document.createElement('a');
    registerLink.href = '#/register';
    registerLink.textContent = 'Register';
    registerLink.className = 'btn btn-primary';
    
    nav.appendChild(loginLink);
    nav.appendChild(registerLink);
  }
  
  container.appendChild(logoLink);
  container.appendChild(nav);
  navbar.appendChild(container);
  
  return navbar;
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
});
