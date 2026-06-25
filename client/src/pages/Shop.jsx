import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';
import { motion } from 'framer-motion';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useI18n();
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    axios.get('/api/products', { params }).then(res => setProducts(res.data.products || [])).catch(() => {});
  }, [query, category, sort, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <h1 className="text-4xl font-bold font-display text-gradient flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
              {t('nav.shop')}
              {category && <span className="text-xl text-gray-400 font-normal">/ {category}</span>}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <select value={sort} onChange={e => { setSort(e.target.value); updateFilter('sort', e.target.value); }} className="input-field pr-8 appearance-none cursor-pointer">
                  <option value="">{t('shop.sort')}</option>
                  <option value="price_asc">{t('shop.priceLow')}</option>
                  <option value="price_desc">{t('shop.priceHigh')}</option>
                  <option value="newest">{t('shop.newest')}</option>
                  <option value="rating">{t('shop.topRated')}</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="number" value={minPrice} onChange={e => { setMinPrice(e.target.value); updateFilter('minPrice', e.target.value); }} className="input-field py-1.5 w-20" placeholder="Min" />
                <span className="text-gray-400">—</span>
                <input type="number" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); updateFilter('maxPrice', e.target.value); }} className="input-field py-1.5 w-20" placeholder="Max" />
              </div>
            </div>
          </div>

          {query && <p className="mb-6 text-gray-500">{t('shop.searchResults')} "<strong>{query}</strong>" ({products.length})</p>}

          {products.length === 0 ? (
            <div className="card-solid text-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <p className="text-xl text-gray-500 mb-4">{t('shop.noProducts')}</p>
              <p className="text-gray-400">{t('shop.tryDifferent')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
          <RecentlyViewed />
        </motion.div>
      </div>
    </div>
  );
}
