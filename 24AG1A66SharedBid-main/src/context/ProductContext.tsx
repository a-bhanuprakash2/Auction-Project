import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Bid, CollaborativeBid } from '@/types';

interface ProductContextType {
  products: Product[];
  bids: Bid[];
  collaborativeBids: CollaborativeBid[];
  addProduct: (product: Omit<Product, 'id' | 'currentBid' | 'bidsCount' | 'status'>) => void;
  placeBid: (bid: Omit<Bid, 'id' | 'timestamp'>) => void;
  joinCollaborativeBid: (productId: string, userId: string, userName: string, amount: number) => void;
  createCollaborativeBid: (productId: string, userId: string, userName: string, amount: number) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByStatus: (status: Product['status']) => Product[];
  getSellerProducts: (sellerId: string) => Product[];
  getBidsByBidder: (bidderId: string) => Bid[];
  getUserCollaborativeBids: (userId: string) => CollaborativeBid[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Initial mock product data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Vintage Watch Collection',
    description: 'A rare collection of vintage watches from the 1950s.',
    imageUrl: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80',
    sellerId: '1',
    sellerName: 'John Seller',
    basePrice: 1500,
    currentBid: 1750,
    bidsCount: 7,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Collectibles',
    condition: 'Good',
    status: 'active'
  },
  {
    id: 'p2',
    title: 'Modern Art Painting',
    description: 'Original painting by contemporary artist Jane Doe.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80',
    sellerId: '1',
    sellerName: 'John Seller',
    basePrice: 3000,
    currentBid: 3200,
    bidsCount: 4,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Art',
    condition: 'Excellent',
    status: 'active',
    collaborativeBidding: {
      id: 'cb1',
      productId: 'p2',
      participantCount: 3,
      totalAmount: 1650,
      status: 'forming',
      participants: [
        {
          userId: '2',
          userName: 'Jane Bidder',
          contributionAmount: 550,
          joinedAt: new Date().toISOString(),
        },
        {
          userId: 'user3',
          userName: 'Mike Brown',
          contributionAmount: 600,
          joinedAt: new Date().toISOString(),
        },
        {
          userId: 'user4',
          userName: 'Sarah Wilson',
          contributionAmount: 500,
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    }
  },
  {
    id: 'p3',
    title: 'Gaming PC Setup',
    description: 'Complete gaming PC setup with high-end specs and peripherals.',
    imageUrl: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=800&q=80',
    sellerId: '1',
    sellerName: 'John Seller',
    basePrice: 2000,
    currentBid: 2400,
    bidsCount: 12,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Electronics',
    condition: 'Like New',
    status: 'active'
  },
  {
    id: 'p4',
    title: 'Luxury Leather Sofa',
    description: 'Premium Italian leather sofa in excellent condition.',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    sellerId: 'user3',
    sellerName: 'Mike Brown',
    basePrice: 1200,
    currentBid: 1450,
    bidsCount: 5,
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Furniture',
    condition: 'Good',
    status: 'active'
  },
  {
    id: 'p5',
    title: 'Antique Dining Table',
    description: 'Beautiful antique oak dining table from the 19th century.',
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
    sellerId: '1',
    sellerName: 'John Seller',
    basePrice: 2500,
    currentBid: 2700,
    bidsCount: 3,
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Furniture',
    condition: 'Vintage',
    status: 'sold'
  }
];

// Initial mock bids
const INITIAL_BIDS: Bid[] = [
  {
    id: 'bid1',
    productId: 'p1',
    bidderId: '2',
    bidderName: 'Jane Bidder',
    amount: 1600,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'bid2',
    productId: 'p1',
    bidderId: 'user3',
    bidderName: 'Mike Brown',
    amount: 1750,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'bid3',
    productId: 'p3',
    bidderId: '2',
    bidderName: 'Jane Bidder',
    amount: 2400,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
];

// Initial mock collaborative bids
const INITIAL_COLLABORATIVE_BIDS: CollaborativeBid[] = [
  {
    id: 'cb1',
    productId: 'p2',
    participantCount: 3,
    totalAmount: 1650,
    status: 'forming',
    participants: [
      {
        userId: '2',
        userName: 'Jane Bidder',
        contributionAmount: 550,
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'user3',
        userName: 'Mike Brown',
        contributionAmount: 600,
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'user4',
        userName: 'Sarah Wilson',
        contributionAmount: 500,
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  }
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or use initial data
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('auctionProducts');
    return savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;
  });
  
  const [bids, setBids] = useState<Bid[]>(() => {
    const savedBids = localStorage.getItem('auctionBids');
    return savedBids ? JSON.parse(savedBids) : INITIAL_BIDS;
  });
  
  const [collaborativeBids, setCollaborativeBids] = useState<CollaborativeBid[]>(() => {
    const savedCollabBids = localStorage.getItem('auctionCollaborativeBids');
    return savedCollabBids ? JSON.parse(savedCollabBids) : INITIAL_COLLABORATIVE_BIDS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('auctionProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('auctionBids', JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem('auctionCollaborativeBids', JSON.stringify(collaborativeBids));
  }, [collaborativeBids]);

  const addProduct = (productData: Omit<Product, 'id' | 'currentBid' | 'bidsCount' | 'status'>) => {
    const newProduct: Product = {
      id: `product_${Date.now()}`,
      ...productData,
      currentBid: productData.basePrice,
      bidsCount: 0,
      status: 'active'
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const placeBid = (bidData: Omit<Bid, 'id' | 'timestamp'>) => {
    const newBid: Bid = {
      id: `bid_${Date.now()}`,
      ...bidData,
      timestamp: new Date().toISOString()
    };
    
    setBids(prevBids => [...prevBids, newBid]);
    
    // Update product's current bid
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === bidData.productId
          ? { 
              ...product, 
              currentBid: bidData.amount,
              bidsCount: product.bidsCount + 1
            }
          : product
      )
    );
  };

  const joinCollaborativeBid = (productId: string, userId: string, userName: string, amount: number) => {
    setCollaborativeBids(prevBids => 
      prevBids.map(bid => {
        if (bid.productId === productId) {
          // Check if user is already a participant
          const existingParticipant = bid.participants.find(p => p.userId === userId);
          
          if (existingParticipant) {
            // Update contribution amount
            return {
              ...bid,
              totalAmount: bid.totalAmount - existingParticipant.contributionAmount + amount,
              participants: bid.participants.map(p => 
                p.userId === userId
                  ? { ...p, contributionAmount: amount }
                  : p
              )
            };
          } else {
            // Add new participant
            return {
              ...bid,
              participantCount: bid.participantCount + 1,
              totalAmount: bid.totalAmount + amount,
              participants: [
                ...bid.participants,
                {
                  userId,
                  userName,
                  contributionAmount: amount,
                  joinedAt: new Date().toISOString()
                }
              ]
            };
          }
        }
        return bid;
      })
    );
  };

  const createCollaborativeBid = (productId: string, userId: string, userName: string, amount: number) => {
    const newCollaborativeBid: CollaborativeBid = {
      id: `collab_${Date.now()}`,
      productId,
      participantCount: 1,
      totalAmount: amount,
      status: 'forming',
      participants: [
        {
          userId,
          userName,
          contributionAmount: amount,
          joinedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    
    setCollaborativeBids(prevBids => [...prevBids, newCollaborativeBid]);
    
    // Update product with the collaborative bid reference
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId
          ? { 
              ...product, 
              collaborativeBidding: newCollaborativeBid
            }
          : product
      )
    );
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getProductsByStatus = (status: Product['status']) => {
    return products.filter(product => product.status === status);
  };

  const getSellerProducts = (sellerId: string) => {
    return products.filter(product => product.sellerId === sellerId);
  };

  const getBidsByBidder = (bidderId: string) => {
    return bids.filter(bid => bid.bidderId === bidderId);
  };

  const getUserCollaborativeBids = (userId: string) => {
    return collaborativeBids.filter(bid => 
      bid.participants.some(participant => participant.userId === userId)
    );
  };

  return (
    <ProductContext.Provider 
      value={{
        products,
        bids,
        collaborativeBids,
        addProduct,
        placeBid,
        joinCollaborativeBid,
        createCollaborativeBid,
        getProductById,
        getProductsByStatus,
        getSellerProducts,
        getBidsByBidder,
        getUserCollaborativeBids
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
