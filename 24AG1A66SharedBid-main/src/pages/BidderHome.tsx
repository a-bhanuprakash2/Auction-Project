
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductGrid from '@/components/ProductGrid';
import { useAuth } from '@/context/AuthContext';
import { useProduct } from '@/context/ProductContext';
import { Link } from 'react-router-dom';

const BidderHome = () => {
  const { currentUser } = useAuth();
  const { products } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter products based on search query and filters
  const filteredProducts = products.filter(product => {
    // Filter by status (always show active products)
    if (product.status !== 'active') return false;
    
    // Filter by search query
    if (
      searchQuery &&
      !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.description.toLowerCase().includes(searchQuery.toLowerCase())
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
  
  // Get collaborative products
  const collaborativeProducts = filteredProducts.filter(p => p.collaborativeBidding);
  
  // Get normal products (non-collaborative)
  const regularProducts = filteredProducts.filter(p => !p.collaborativeBidding);

  // Extract unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {currentUser?.name}</h1>
            <p className="text-muted-foreground">Find and bid on your favorite items</p>
          </div>
          <Button asChild>
            <Link to="/dashboard">View My Dashboard</Link>
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                  <SelectItem value="5000">Over $5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Tabs for All Items / Collaborative Bidding */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Listings</TabsTrigger>
            <TabsTrigger value="collaborative">
              Collaborative Bidding
              {collaborativeProducts.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                  {collaborativeProducts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ProductGrid products={filteredProducts} />
          </TabsContent>
          
          <TabsContent value="collaborative">
            {collaborativeProducts.length > 0 ? (
              <ProductGrid products={collaborativeProducts} />
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                <h3 className="text-lg font-semibold mb-2">No collaborative listings available</h3>
                <p className="text-muted-foreground mb-4">
                  Collaborative bidding allows you to join forces with other bidders on high-value items.
                </p>
                <Button variant="outline" asChild>
                  <Link to="#start-collaborative">Learn About Collaborative Bidding</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Featured section */}
      <section className="bg-purple-50 py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">How Collaborative Bidding Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-purple-100 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="text-lg font-bold text-purple-800">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Join a Group</h3>
              <p className="text-muted-foreground">
                Browse listings marked "Collaborative" and join an existing bidding group by contributing your share.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-purple-100 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="text-lg font-bold text-purple-800">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Pool Resources</h3>
              <p className="text-muted-foreground">
                Combine funds with other bidders to reach the target bid amount for high-value items.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-purple-100 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="text-lg font-bold text-purple-800">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Share Ownership</h3>
              <p className="text-muted-foreground">
                If your group wins, you'll share ownership of the item based on your contribution percentage.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BidderHome;
