
// Product Service
const ProductService = {
  // Sample data for products
  sampleProducts: [
    {
      id: 'p1',
      title: 'Vintage Watch',
      description: 'A beautiful vintage watch from the 1950s in excellent condition.',
      imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop',
      sellerId: '1',
      sellerName: 'John Seller',
      basePrice: 100,
      currentBid: 125,
      bidsCount: 3,
      endTime: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      category: 'Accessories',
      condition: 'Excellent',
      status: 'active'
    },
    {
      id: 'p2',
      title: 'Professional Camera',
      description: 'High-end DSLR camera with multiple lenses and accessories.',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop',
      sellerId: '1',
      sellerName: 'John Seller',
      basePrice: 500,
      currentBid: 650,
      bidsCount: 5,
      endTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
      category: 'Electronics',
      condition: 'Good',
      status: 'active',
      collaborativeBidding: {
        id: 'cb1',
        productId: 'p2',
        participantCount: 2,
        totalAmount: 450,
        status: 'forming',
        participants: [
          {
            userId: '2',
            userName: 'Jane Bidder',
            contributionAmount: 300,
            joinedAt: new Date().toISOString()
          },
          {
            userId: '3',
            userName: 'Bob Smith',
            contributionAmount: 150,
            joinedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      }
    }
  ],
  
  sampleBids: [
    {
      id: 'b1',
      productId: 'p1',
      bidderId: '2',
      bidderName: 'Jane Bidder',
      amount: 110,
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 'b2',
      productId: 'p1',
      bidderId: '3',
      bidderName: 'Bob Smith',
      amount: 120,
      timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
    },
    {
      id: 'b3',
      productId: 'p1',
      bidderId: '2',
      bidderName: 'Jane Bidder',
      amount: 125,
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }
  ],

  // Initialize products if not already in localStorage
  init() {
    if (!localStorage.getItem('products')) {
      localStorage.setItem('products', JSON.stringify(this.sampleProducts));
    }
    
    if (!localStorage.getItem('bids')) {
      localStorage.setItem('bids', JSON.stringify(this.sampleBids));
    }
  },

  // Get all products
  getAllProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
  },

  // Get product by ID
  getProduct(id) {
    const products = this.getAllProducts();
    return products.find(product => product.id === id) || null;
  },

  // Get all bids
  getAllBids() {
    return JSON.parse(localStorage.getItem('bids') || '[]');
  },

  // Get bids for a product
  getProductBids(productId) {
    const bids = this.getAllBids();
    return bids.filter(bid => bid.productId === productId);
  },

  // Get bids by a bidder
  getBidderBids(bidderId) {
    const bids = this.getAllBids();
    return bids.filter(bid => bid.bidderId === bidderId);
  },

  // Get products by a seller
  getSellerProducts(sellerId) {
    const products = this.getAllProducts();
    return products.filter(product => product.sellerId === sellerId);
  },

  // Place a bid
  placeBid(productId, bidderId, bidderName, amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const products = this.getAllProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
          reject(new Error('Product not found'));
          return;
        }
        
        if (product.status !== 'active') {
          reject(new Error('This auction is not active'));
          return;
        }
        
        if (amount <= product.currentBid) {
          reject(new Error('Bid amount must be higher than current bid'));
          return;
        }
        
        // Create new bid
        const newBid = {
          id: `bid_${Date.now()}`,
          productId,
          bidderId,
          bidderName,
          amount,
          timestamp: new Date().toISOString()
        };
        
        // Update product current bid
        product.currentBid = amount;
        product.bidsCount += 1;
        
        // Save updated product and bids
        const updatedProducts = products.map(p => p.id === productId ? product : p);
        const bids = this.getAllBids();
        bids.push(newBid);
        
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        localStorage.setItem('bids', JSON.stringify(bids));
        
        resolve(newBid);
      }, 500);
    });
  },
  
  // Create a new product (for sellers)
  createProduct(productData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const products = this.getAllProducts();
          
          const newProduct = {
            id: `product_${Date.now()}`,
            ...productData,
            currentBid: productData.basePrice,
            bidsCount: 0,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          
          products.push(newProduct);
          localStorage.setItem('products', JSON.stringify(products));
          
          resolve(newProduct);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },
  
  // Create collaborative bid
  createCollaborativeBid(productId, userId, userName, contributionAmount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const products = this.getAllProducts();
          const product = products.find(p => p.id === productId);
          
          if (!product) {
            reject(new Error('Product not found'));
            return;
          }
          
          const collaborativeBid = {
            id: `collab_${Date.now()}`,
            productId,
            totalAmount: contributionAmount,
            participantCount: 1,
            status: 'forming',
            participants: [
              {
                userId,
                userName,
                contributionAmount,
                joinedAt: new Date().toISOString()
              }
            ],
            createdAt: new Date().toISOString()
          };
          
          // Add collaborative bidding to the product
          product.collaborativeBidding = collaborativeBid;
          
          // Save updated products
          const updatedProducts = products.map(p => p.id === productId ? product : p);
          localStorage.setItem('products', JSON.stringify(updatedProducts));
          
          resolve(collaborativeBid);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },
  
  // Join collaborative bid
  joinCollaborativeBid(productId, userId, userName, contributionAmount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const products = this.getAllProducts();
          const product = products.find(p => p.id === productId);
          
          if (!product || !product.collaborativeBidding) {
            reject(new Error('Collaborative bid not found'));
            return;
          }
          
          const collab = product.collaborativeBidding;
          
          // Check if user already joined
          const existingParticipant = collab.participants.find(p => p.userId === userId);
          
          if (existingParticipant) {
            // Update existing contribution
            existingParticipant.contributionAmount += contributionAmount;
          } else {
            // Add new participant
            collab.participants.push({
              userId,
              userName,
              contributionAmount,
              joinedAt: new Date().toISOString()
            });
            collab.participantCount += 1;
          }
          
          // Update total amount
          collab.totalAmount += contributionAmount;
          
          // Check if total reached or exceeded current bid
          if (collab.totalAmount >= product.currentBid) {
            collab.status = 'active';
            
            // Place the collaborative bid
            product.currentBid = collab.totalAmount;
            product.bidsCount += 1;
            
            // Add a bid record
            const bids = this.getAllBids();
            const newBid = {
              id: `bid_${Date.now()}`,
              productId,
              bidderId: `collab_${collab.id}`,
              bidderName: 'Collaborative Bid',
              amount: collab.totalAmount,
              timestamp: new Date().toISOString(),
              isCollaborative: true,
              participantCount: collab.participantCount
            };
            bids.push(newBid);
            localStorage.setItem('bids', JSON.stringify(bids));
          }
          
          // Save updated products
          const updatedProducts = products.map(p => p.id === productId ? product : p);
          localStorage.setItem('products', JSON.stringify(updatedProducts));
          
          resolve(collab);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },
  
  // Get user collaborative bids
  getUserCollaborativeBids(userId) {
    const products = this.getAllProducts();
    const collaborativeBids = [];
    
    products.forEach(product => {
      if (product.collaborativeBidding) {
        const collab = product.collaborativeBidding;
        const isParticipant = collab.participants.some(p => p.userId === userId);
        
        if (isParticipant) {
          collaborativeBids.push({
            ...collab,
            productTitle: product.title,
            productImage: product.imageUrl,
            currentBid: product.currentBid
          });
        }
      }
    });
    
    return collaborativeBids;
  },
  
  // Complete auction (for admin/seller)
  completeAuction(productId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const products = this.getAllProducts();
          const product = products.find(p => p.id === productId);
          
          if (!product) {
            reject(new Error('Product not found'));
            return;
          }
          
          product.status = 'sold';
          
          // Save updated products
          const updatedProducts = products.map(p => p.id === productId ? product : p);
          localStorage.setItem('products', JSON.stringify(updatedProducts));
          
          resolve(product);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }
};

// Initialize product service
document.addEventListener('DOMContentLoaded', () => {
  ProductService.init();
});
