
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showActions = true }) => {
  const { currentUser } = useAuth();
  const isOwner = currentUser?.id === product.sellerId;
  const hasCollaborativeBidding = !!product.collaborativeBidding;
  
  // Calculate time remaining
  const endTime = new Date(product.endTime);
  const isExpired = endTime < new Date();
  const timeRemaining = isExpired 
    ? 'Ended' 
    : formatDistanceToNow(endTime, { addSuffix: true });
  
  return (
    <Card className="overflow-hidden card-hover">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {product.status === 'sold' && (
            <Badge variant="destructive">Sold</Badge>
          )}
          {hasCollaborativeBidding && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
              Collaborative
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.title}</CardTitle>
          <p className="font-semibold text-purple-600">${product.currentBid.toLocaleString()}</p>
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>Base: ${product.basePrice.toLocaleString()}</span>
          <span>{product.bidsCount} bids</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-2">
        <p className="text-sm line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{product.category}</span>
          <span>Condition: {product.condition}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex items-center justify-between">
        <div className="text-sm">
          <span className={isExpired ? 'text-red-500' : 'text-green-600'}>
            {timeRemaining}
          </span>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            {isOwner ? (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/product/manage/${product.id}`}>Manage</Link>
              </Button>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to={`/product/${product.id}`}>View & Bid</Link>
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
