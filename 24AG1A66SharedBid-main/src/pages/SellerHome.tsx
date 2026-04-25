
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductGrid from '@/components/ProductGrid';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useProduct } from '@/context/ProductContext';
import { Link } from 'react-router-dom';

import { useToast } from '@/components/ui/use-toast';

const SellerHome = () => {
  const { currentUser } = useAuth();
  const { products, addProduct } = useProduct();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    imageUrl: '',
    basePrice: 0,
    category: '',
    condition: '',
    endTime: ''
  });
  
  // Filter seller's products
  const sellerProducts = products.filter(p => p.sellerId === currentUser?.id);
  const activeProducts = sellerProducts.filter(p => p.status === 'active');
  const soldProducts = sellerProducts.filter(p => p.status === 'sold');
  
  // Calculate stats
  const totalSales = soldProducts.reduce((sum, p) => sum + p.currentBid, 0);
  const totalBids = sellerProducts.reduce((sum, p) => sum + p.bidsCount, 0);
  const averageBidAmount = totalBids > 0 ? 
    sellerProducts.reduce((sum, p) => sum + p.currentBid, 0) / sellerProducts.length : 0;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'basePrice' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      // Calculate end date (7 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      addProduct({
        ...newProduct,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        endTime: endDate.toISOString()
      });
      
      setIsDialogOpen(false);
      
      toast({
        title: 'Product listed successfully',
        description: 'Your item has been added to the marketplace.',
      });
      
      // Reset form
      setNewProduct({
        title: '',
        description: '',
        imageUrl: '',
        basePrice: 0,
        category: '',
        condition: '',
        endTime: ''
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to list product',
        description: 'An error occurred while trying to list your product.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and track sales</p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard">Full Dashboard</Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>List New Item</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>List a New Item</DialogTitle>
                    <DialogDescription>
                      Fill out the details below to list your item for auction.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={newProduct.title}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={newProduct.imageUrl}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="basePrice" className="text-right">Base Price ($)</Label>
                      <Input
                        id="basePrice"
                        name="basePrice"
                        type="number"
                        min="1"
                        value={newProduct.basePrice || ''}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <Select
                        name="category"
                        value={newProduct.category}
                        onValueChange={(value) => handleInputChange({ target: { name: 'category', value }} as any)}
                      >
                        <SelectTrigger id="category" className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Furniture">Furniture</SelectItem>
                          <SelectItem value="Art">Art</SelectItem>
                          <SelectItem value="Collectibles">Collectibles</SelectItem>
                          <SelectItem value="Vehicles">Vehicles</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="condition" className="text-right">Condition</Label>
                      <Select
                        name="condition"
                        value={newProduct.condition}
                        onValueChange={(value) => handleInputChange({ target: { name: 'condition', value }} as any)}
                      >
                        <SelectTrigger id="condition" className="col-span-3">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Vintage">Vintage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">List Item</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Active Listings"
            value={activeProducts.length}
            description="Current listings"
          />
          <StatCard
            title="Total Sales"
            value={`$${totalSales.toLocaleString()}`}
            description={`From ${soldProducts.length} sold items`}
          />
          <StatCard
            title="Total Bids Received"
            value={totalBids}
            description={`Avg $${averageBidAmount.toLocaleString()} per item`}
          />
        </div>
        
        {/* Product Listings */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Active Listings
              <span className="ml-2 bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                {activeProducts.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="sold">
              Sold Items
              <span className="ml-2 bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                {soldProducts.length}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeProducts.length > 0 ? (
              <ProductGrid products={activeProducts} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Listings</CardTitle>
                  <CardDescription>You don't have any active listings at the moment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Create your first listing to start selling on SharedBid.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setIsDialogOpen(true)}>List an Item</Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="sold">
            {soldProducts.length > 0 ? (
              <ProductGrid products={soldProducts} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Sold Items</CardTitle>
                  <CardDescription>You haven't sold any items yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Your sold items will appear here once they've been purchased.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Tips section */}
      <section className="bg-purple-50 py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">Seller Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Quality Photos</h3>
              <p className="text-muted-foreground">
                Use high-quality, well-lit photos showing your item from multiple angles to attract more bidders.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Detailed Descriptions</h3>
              <p className="text-muted-foreground">
                Include comprehensive details about condition, dimensions, history, and any flaws or defects.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Competitive Pricing</h3>
              <p className="text-muted-foreground">
                Set a reasonable starting price to attract initial bids, but ensure it covers your minimum acceptable value.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellerHome;
