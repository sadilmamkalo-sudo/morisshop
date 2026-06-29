import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { lang } = useI18n();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    if (ids.length > 0) {
      Promise.all(ids.map(id => axios.get(`/api/products/${id}`).then(r => r.data)))
        .then(setProducts).catch(() => {});
    }
  }, [ids.join(',')]);

  const removeProduct = (id) => {
    const updated = ids.filter(i => i !== id);
    setProducts(prev => prev.filter(p => p._id !== id));
    if (updated.length === 0) {
      try { localStorage.setItem('morisshop_compare', '[]'); } catch {}
    } else {
      try { localStorage.setItem('morisshop_compare', JSON.stringify(updated)); } catch {}
    }
    window.dispatchEvent(new Event('storage'));
  };

  const fields = [
    { key: 'image', label: 'Image' },
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'rating', label: 'Rating' },
    { key: 'stock', label: 'Stock' },
  ];

  const getFieldValue = (product, field) => {
    if (field === 'image') return product.images?.[0];
    if (field === 'name') return product.name?.[lang] || product.name?.en || '';
    if (field === 'price') return `${product.price} DH`;
    if (field === 'description') return product.description?.[lang] || product.description?.en || '';
    if (field === 'rating') return product.averageRating || product.rating || 0;
    if (field === 'stock') return product.stock > 0 ? 'In Stock' : 'Out of Stock';
    return product[field] || '';
  };

  const isDifferent = (field, index) => {
    if (products.length < 2) return false;
    const values = products.map(p => String(getFieldValue(p, field)));
    return new Set(values).size > 1;
  };

  return (
    <div className="min-h-screen bg-clay-50 dark:bg-ink-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-clay-500 rounded inline-block"></span>
            Compare Products
          </h1>

          {products.length === 0 ? (
            <div className="card text-center py-20">
              <p className="text-xl text-ink-500 mb-4">No products to compare</p>
              <Link to="/shop" className="btn-primary">Browse Products</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full card overflow-hidden">
                <thead>
                  <tr className="bg-ink-50 dark:bg-ink-800/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold w-32">Feature</th>
                    {products.map(p => (
                      <th key={p._id} className="px-4 py-3 text-center text-sm font-semibold min-w-[200px]">
                        <button onClick={() => removeProduct(p._id)} className="float-right text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, fi) => (
                    <tr key={field.key} className={`border-t border-ink-100 dark:border-ink-700/50 ${isDifferent(field.key, fi) ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-ink-500">{field.label}</td>
                      {products.map((p, pi) => (
                        <td key={p._id} className={`px-4 py-3 text-center text-sm ${isDifferent(field.key, pi) ? 'font-bold text-clay-600' : ''}`}>
                          {field.key === 'image' ? (
                            p.images?.[0] ? <img src={p.images[0]} alt="" className="w-24 h-24 object-cover rounded-xl mx-auto" /> : <div className="w-24 h-24 bg-ink-200 dark:bg-ink-700 rounded-xl mx-auto"></div>
                          ) : field.key === 'rating' ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span>{Number(getFieldValue(p, field.key)).toFixed(1)}</span>
                            </div>
                          ) : field.key === 'stock' ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>{getFieldValue(p, field.key)}</span>
                          ) : field.key === 'price' ? (
                            <span className="text-lg font-bold text-clay-500">{getFieldValue(p, field.key)}</span>
                          ) : field.key === 'description' ? (
                            <p className="text-xs text-ink-500 line-clamp-3">{getFieldValue(p, field.key)}</p>
                          ) : (
                            <span className="font-medium">{getFieldValue(p, field.key)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-ink-200 dark:border-ink-700">
                    <td className="px-4 py-3"></td>
                    {products.map(p => (
                      <td key={p._id} className="px-4 py-3 text-center">
                        <button onClick={() => { addToCart(p); toast.success('Added to cart'); }} className="btn-primary text-xs py-2 px-5">
                          Add to Cart
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
