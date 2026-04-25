
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useProduct } from '@/context/ProductContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import ProductGrid from '@/components/ProductGrid';
import BiddingHistory from '@/components/BiddingHistory';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { 
    products, 
    bids, 
    collaborativeBids,
    getSellerProducts,
    getBidsByBidder,
    getUserCollaborativeBids
  } = useProduct();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) return null;
  
  // Bidder-specific data
  const userBids = getBidsByBidder(currentUser.id);
  const userCollaborativeBids = getUserCollaborativeBids(currentUser.id);
  
  const biddedProductIds = userBids.map(bid => bid.productId);
  const biddedProducts = products.filter(p => biddedProductIds.includes(p.id));
  
  const wonBids = biddedProducts.filter(p => 
    p.status === 'sold' && 
    p.currentBid === userBids.find(b => b.productId === p.id)?.amount
  );
  
  // Seller-specific data
  const sellerProducts = getSellerProducts(currentUser.id);
  const activeListings = sellerProducts.filter(p => p.status === 'active');
  const soldItems = sellerProducts.filter(p => p.status === 'sold');
  
  // Calculate stats
  const bidderStats = {
    participatedBids: userBids.length,
    wonBids: wonBids.length,
    activeCollaborations: userCollaborativeBids.filter(cb => cb.status === 'forming' || cb.status === 'active').length,
    totalSpent: wonBids.reduce((sum, p) => sum + p.currentBid, 0)
  };
  
  const sellerStats = {
    totalSales: soldItems.reduce((sum, p) => sum + p.currentBid, 0),
    activeListings: activeListings.length,
    totalBids: sellerProducts.reduce((sum, p) => sum + p.bidsCount, 0),
    averageBidPrice: sellerProducts.length > 0 ? 
      sellerProducts.reduce((sum, p) => sum + p.currentBid, 0) / sellerProducts.length :
      0
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
        
        <Tabs defaultValue={currentUser.role} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="bidder">Bidder Dashboard</TabsTrigger>
            <TabsTrigger value="seller">Seller Dashboard</TabsTrigger>
          </TabsList>
          
          {/* Bidder Dashboard Tab */}
          <TabsContent value="bidder">
            <div className="space-y-8">
              {/* Bidder Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Bids Placed"
                  value={bidderStats.participatedBids}
                  description="Total bids you've made"
                />
                <StatCard
                  title="Auctions Won"
                  value={bidderStats.wonBids}
                  description="Items you've successfully won"
                />
                <StatCard
                  title="Active Collaborations"
                  value={bidderStats.activeCollaborations}
                  description="Group bids you're participating in"
                />
                <StatCard
                  title="Total Spent"
                  value={`$${bidderStats.totalSpent.toLocaleString()}`}
                  description="On won auctions"
                />
              </div>
              
              {/* Bidding Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Bids</CardTitle>
                      <CardDescription>Your recent bidding activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BiddingHistory bids={userBids} maxHeight="300px" />
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Collaborative Bids</CardTitle>
                      <CardDescription>Group bidding participations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userCollaborativeBids.length > 0 ? (
                        <ScrollArea className="h-[300px] pr-4">
                          <div className="space-y-4">
                            {userCollaborativeBids.map(collab => {
                              const product = products.find(p => p.id === collab.productId);
                              if (!product) return null;
                              
                              const userContribution = collab.participants.find(
                                p => p.userId === currentUser.id
                              )?.contributionAmount || 0;
                              
                              const percentageFunded = Math.round((collab.totalAmount / product.currentBid) * 100);
                              
                              return (
                                <div key={collab.id} className="border rounded-md p-3">
                                  <div className="flex justify-between mb-1">
                                    <Link to={`/product/${product.id}`} className="font-medium hover:text-purple-600">
                                      {product.title}
                                    </Link>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      collab.status === 'forming' ? 'bg-amber-100 text-amber-800' :
                                      collab.status === 'active' ? 'bg-green-100 text-green-800' :
                                      collab.status === 'won' ? 'bg-purple-100 text-purple-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {collab.status}
                                    </span>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Progress</span>
                                      <span>{percentageFunded}%</span>
                                    </div>
                                    <Progress value={percentageFunded} className="h-1.5" />
                                  </div>
                                  
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Your contribution: ${userContribution}</span>
                                    <span>{collab.participantCount} participants</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center">
                          <p className="text-muted-foreground mb-4 text-center">
                            You're not currently participating in any collaborative bids
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/bidder">Explore Collaborative Listings</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Items Won */}
              <Card>
                <CardHeader>
                  <CardTitle>Items Won</CardTitle>
                  <CardDescription>Auctions you've successfully won</CardDescription>
                </CardHeader>
                <CardContent>
                  {wonBids.length > 0 ? (
                    <ProductGrid products={wonBids} showActions={false} />
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        You haven't won any auctions yet. Keep bidding!
                      </p>
                      <Button asChild>
                        <Link to="/bidder">Browse Listings</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Seller Dashboard Tab */}
          <TabsContent value="seller">
            <div className="space-y-8">
              {/* Seller Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Sales"
                  value={`$${sellerStats.totalSales.toLocaleString()}`}
                  description={`From ${soldItems.length} items`}
                />
                <StatCard
                  title="Active Listings"
                  value={sellerStats.activeListings}
                  description="Currently available for bidding"
                />
                <StatCard
                  title="Total Bids Received"
                  value={sellerStats.totalBids}
                  description="Across all your items"
                />
                <StatCard
                  title="Avg. Bid Price"
                  value={`$${sellerStats.averageBidPrice.toLocaleString()}`}
                  description="Per item average"
                />
              </div>
              
              {/* Active Listings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Active Listings</CardTitle>
                    <CardDescription>Your items currently up for auction</CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/seller">Add New Listing</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {activeListings.length > 0 ? (
                    <ProductGrid products={activeListings} />
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        You don't have any active listings. Create a new listing to start selling!
                      </p>
                      <Button asChild>
                        <Link to="/seller">Create Listing</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>Your recently sold items</CardDescription>
                </CardHeader>
                <CardContent>
                  {soldItems.length > 0 ? (
                    <ProductGrid products={soldItems} showActions={false} />
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-muted-foreground">
                        You haven't sold any items yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Sales Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Overview of your selling activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Most Popular Categories */}
                    <div>
                      <h4 className="font-medium mb-2">Popular Categories</h4>
                      <div className="space-y-2">
                        {Array.from(
                          new Set(sellerProducts.map(p => p.category))
                        ).map(category => {
                          const count = sellerProducts.filter(p => p.category === category).length;
                          const percentage = Math.round((count / sellerProducts.length) * 100);
                          
                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{category}</span>
                                <span>{count} items ({percentage}%)</span>
                              </div>
                              <Progress value={percentage} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div>
                      <h4 className="font-medium mb-2">Recent Activity</h4>
                      <div className="space-y-2">
                        {sellerProducts.slice(0, 3).map(product => (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.status === 'active' ? 'Ends' : 'Ended'} {formatDistanceToNow(new Date(product.endTime), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${product.currentBid.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{product.bidsCount} bids</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
