import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useProduct } from '@/context/ProductContext';
import BiddingHistory from '@/components/BiddingHistory';
import CollaborativeBidCard from '@/components/CollaborativeBidCard';

const ProductDetail = () => {
  const { productId } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { getProductById, bids, placeBid, createCollaborativeBid, joinCollaborativeBid, products } = useProduct();
  
  const [product, setProduct] = useState(getProductById(productId || ''));
  const [bidAmount, setBidAmount] = useState(0);
  const [collaborativeBidAmount, setCollaborativeBidAmount] = useState(0);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [isCollabDialogOpen, setIsCollabDialogOpen] = useState(false);
  
  // Get product bids
  const productBids = bids.filter(bid => bid.productId === productId);
  
  // Calculate minimum bid
  const minBid = product ? product.currentBid + 1 : 0;
  
  // Calculate time remaining
  const endTime = product ? new Date(product.endTime) : new Date();
  const isExpired = endTime < new Date();
  const timeRemaining = isExpired 
    ? 'Auction ended' 
    : formatDistanceToNow(endTime, { addSuffix: true });
  
  // Check if user can bid
  const canBid = currentUser && 
                 currentUser.role === 'bidder' && 
                 !isExpired && 
                 currentUser.id !== product?.sellerId;
  
  // Check if user has bid on this product
  const userHasBid = currentUser && 
                     productBids.some(bid => bid.bidderId === currentUser.id);
  
  // Refresh product data whenever it changes
  useEffect(() => {
    setProduct(getProductById(productId || ''));
  }, [getProductById, productId]);
  
  // Handle bid submission
  const handlePlaceBid = () => {
    if (!currentUser || !product) return;
    
    if (bidAmount < minBid) {
      toast({
        variant: 'destructive',
        title: 'Bid too low',
        description: `Minimum bid is $${minBid}`,
      });
      return;
    }
    
    placeBid({
      productId: product.id,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount: bidAmount
    });
    
    setIsBidDialogOpen(false);
    
    toast({
      title: 'Bid placed!',
      description: `You have successfully bid $${bidAmount} on ${product.title}`,
    });
    
    // Reset bid amount
    setBidAmount(0);
  };
  
  // Handle collaborative bid submission
  const handleCollaborativeBid = (isCreating = true) => {
    if (!currentUser || !product) return;
    
    if (collaborativeBidAmount < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a positive amount',
      });
      return;
    }
    
    if (isCreating) {
      createCollaborativeBid(
        product.id,
        currentUser.id,
        currentUser.name,
        collaborativeBidAmount
      );
      
      toast({
        title: 'Collaborative bid started!',
        description: `You've started a collaborative bid with $${collaborativeBidAmount}`,
      });
    } else {
      joinCollaborativeBid(
        product.id,
        currentUser.id,
        currentUser.name,
        collaborativeBidAmount
      );
      
      toast({
        title: 'Joined collaborative bid!',
        description: `You've contributed $${collaborativeBidAmount} to the collaborative bid`,
      });
    }
    
    setIsCollabDialogOpen(false);
    setCollaborativeBidAmount(0);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Link to={currentUser?.role === 'seller' ? '/seller' : '/bidder'} className="text-purple-600 hover:underline">&larr; Back to listings</Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg overflow-hidden border">
              <div className="aspect-video relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
                {isExpired && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      Auction Ended
                    </Badge>
                  </div>
                )}
                {product.collaborativeBidding && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-sm px-3 py-1">
                      Collaborative Bidding
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{product.title}</h1>
                    <p className="text-muted-foreground">
                      Listed by {product.sellerName} • {product.category} • {product.condition}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      ${product.currentBid.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current bid • {product.bidsCount} bids
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className={`text-sm font-medium ${isExpired ? 'text-red-500' : 'text-green-600'}`}>
                    {timeRemaining}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="bidding">
                      Bidding History
                      {productBids.length > 0 && (
                        <span className="ml-2 bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                          {productBids.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-gray-700">{product.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Base Price</h3>
                          <p>${product.basePrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Current Bid</h3>
                          <p>${product.currentBid.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bidding">
                    <BiddingHistory bids={productBids} />
                  </TabsContent>
                </Tabs>
                
                <div className="mt-8">
                  {canBid ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        className="flex-1" 
                        onClick={() => {
                          setBidAmount(minBid);
                          setIsBidDialogOpen(true);
                        }}
                      >
                        Place Bid
                      </Button>
                      
                      {!product.collaborativeBidding ? (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsCollabDialogOpen(true)}
                        >
                          Start Collaborative Bid
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      {!currentUser ? (
                        <Button asChild className="w-full">
                          <Link to="/login">Login to Bid</Link>
                        </Button>
                      ) : isExpired ? (
                        <div className="p-4 bg-muted/30 rounded-md text-center">
                          <p className="font-medium">This auction has ended</p>
                        </div>
                      ) : currentUser.role === 'seller' ? (
                        <div className="p-4 bg-muted/30 rounded-md text-center">
                          <p className="font-medium">Sellers cannot bid on items</p>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bid Information */}
          <div className="space-y-6">
            {/* Current Bid Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Bid:</span>
                    <span className="font-bold text-lg">${product.currentBid.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Bid:</span>
                    <span className="font-semibold">${minBid.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Bids:</span>
                    <span>{product.bidsCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Remaining:</span>
                    <span className={isExpired ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                      {timeRemaining}
                    </span>
                  </div>
                  
                  {userHasBid && (
                    <div className="bg-green-50 border border-green-100 p-3 rounded-md">
                      <p className="text-green-700 text-sm font-medium">
                        You have placed bids on this item
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Collaborative Bidding Card */}
            {product.collaborativeBidding && (
              <CollaborativeBidCard
                product={product}
                collaborativeBid={product.collaborativeBidding}
                onJoin={() => setIsCollabDialogOpen(true)}
              />
            )}
            
            {/* Related Items */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">More from this seller</h3>
                <div className="space-y-4">
                  {products
                    .filter(p => p.sellerId === product.sellerId && p.id !== product.id)
                    .slice(0, 3)
                    .map(relatedProduct => (
                      <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="block">
                        <div className="flex gap-4 hover:bg-muted/30 p-2 rounded-md transition-colors">
                          <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={relatedProduct.imageUrl} 
                              alt={relatedProduct.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{relatedProduct.title}</h4>
                            <p className="text-sm text-muted-foreground">Current bid: ${relatedProduct.currentBid}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Place Bid Dialog */}
      <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>
              Enter your bid amount for {product.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Bid Amount ($)</Label>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount || ''}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                min={minBid}
                step="1"
                placeholder={`Minimum bid: $${minBid}`}
              />
            </div>
            
            <div className="text-sm">
              <p className="text-muted-foreground">Current bid: ${product.currentBid.toLocaleString()}</p>
              <p className="text-muted-foreground">Minimum bid: ${minBid.toLocaleString()}</p>
              
              {bidAmount > minBid && (
                <p className="mt-2 text-green-600">Your bid is ${bidAmount - product.currentBid} higher than the current bid</p>
              )}
              
              {bidAmount < minBid && bidAmount > 0 && (
                <p className="mt-2 text-red-500">Your bid must be at least ${minBid}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBidDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBid} disabled={bidAmount < minBid}>
              Place Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Collaborative Bid Dialog */}
      <Dialog open={isCollabDialogOpen} onOpenChange={setIsCollabDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {product.collaborativeBidding ? 'Join Collaborative Bid' : 'Start Collaborative Bid'}
            </DialogTitle>
            <DialogDescription>
              {product.collaborativeBidding 
                ? 'Join others to bid collaboratively on this item' 
                : 'Start a collaborative bid to share ownership with other bidders'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contributionAmount">Your Contribution ($)</Label>
              <Input
                id="contributionAmount"
                type="number"
                value={collaborativeBidAmount || ''}
                onChange={(e) => setCollaborativeBidAmount(parseInt(e.target.value) || 0)}
                min="1"
                step="1"
                placeholder="Enter your contribution"
              />
            </div>
            
            {product.collaborativeBidding && (
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Total:</span>
                  <span>${product.collaborativeBidding.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Amount:</span>
                  <span>${product.currentBid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Still Needed:</span>
                  <span>${(product.currentBid - product.collaborativeBidding.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participants:</span>
                  <span>{product.collaborativeBidding.participantCount}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollabDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleCollaborativeBid(!product.collaborativeBidding)}
              disabled={collaborativeBidAmount < 1}
            >
              {product.collaborativeBidding ? 'Join Bid' : 'Start Collaborative Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
