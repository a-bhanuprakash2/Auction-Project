
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // If already authenticated, redirect to the appropriate home page
  if (isAuthenticated && currentUser) {
    return <Navigate to={currentUser.role === 'seller' ? '/seller' : '/bidder'} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-800 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-purple-600 font-bold text-2xl mb-6">
            SB
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">SharedBid</h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-8">
            The first marketplace with collaborative bidding. Join forces to bid on high-value items and share ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-purple-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-700 font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Bid Solo or Together</h3>
                <p className="text-muted-foreground">
                  Choose to bid individually or join a collaborative bid with other users to share the cost and ownership.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-700 font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Win as a Group</h3>
                <p className="text-muted-foreground">
                  Pool resources with other bidders to win high-value items that might be out of reach individually.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-700 font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Share Ownership</h3>
                <p className="text-muted-foreground">
                  Once the auction is won, ownership is distributed based on each participant's contribution percentage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Path</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <h3 className="text-2xl font-semibold mb-4">Join as a Bidder</h3>
              <p className="mb-6 text-muted-foreground">
                Browse auctions, place bids individually or collaboratively, and build your collection of unique items.
              </p>
              <Button className="w-full" asChild>
                <Link to="/register?role=bidder">Register as Bidder</Link>
              </Button>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <h3 className="text-2xl font-semibold mb-4">Join as a Seller</h3>
              <p className="mb-6 text-muted-foreground">
                List your items for auction, set base prices, and reach a wider audience with collaborative bidding.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register?role=seller">Register as Seller</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join SharedBid today and experience a new way of bidding and selling online.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold mr-2">
                SB
              </div>
              <span className="font-bold text-xl">SharedBid</span>
            </div>
            
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SharedBid. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
