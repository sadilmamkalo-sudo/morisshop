import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getRecentlyViewed } from '../utils/recentlyViewed';

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(getRecentlyViewed().slice(0, 6));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="section-title mb-4">Recently Viewed</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {products.map(p => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
