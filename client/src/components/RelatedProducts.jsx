import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

export default function RelatedProducts({ category, excludeId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!category) return;
    fetch(`/api/products?category=${encodeURIComponent(category)}&limit=5`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list.filter(p => p._id !== excludeId).slice(0, 4));
      })
      .catch(() => {});
  }, [category, excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h3 className="section-title mb-6">Related Products</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
