
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  showActions?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, showActions = true }) => {
  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">Check back later for new listings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} showActions={showActions} />
      ))}
    </div>
  );
};

export default ProductGrid;
