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
    <div className="min-h-screen bg-white dark:bg-ink-950 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-ink-900 dark:text-white">
                {category || t('nav.shop')}
              </h1>
              {query && (
                <p className="text-sm text-ink-500 mt-2">
                  {products.length} {t('shop.searchResults')} &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); updateFilter('sort', e.target.value); }}
                className="px-4 py-2.5 text-sm border border-ink-200 dark:border-ink-700 bg-transparent text-ink-700 dark:text-ink-300 focus:border-ink-900 dark:focus:border-white outline-none"
              >
                <option value="">{t('shop.sort')}</option>
                <option value="price_asc">{t('shop.priceLow')}</option>
                <option value="price_desc">{t('shop.priceHigh')}</option>
                <option value="newest">{t('shop.newest')}</option>
                <option value="rating">{t('shop.topRated')}</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => { setMinPrice(e.target.value); updateFilter('minPrice', e.target.value); }}
                  className="w-20 px-3 py-2.5 text-sm border border-ink-200 dark:border-ink-700 bg-transparent text-ink-700 dark:text-ink-300 focus:border-ink-900 dark:focus:border-white outline-none"
                  placeholder="Min"
                />
                <span className="text-ink-300 dark:text-ink-600">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => { setMaxPrice(e.target.value); updateFilter('maxPrice', e.target.value); }}
                  className="w-20 px-3 py-2.5 text-sm border border-ink-200 dark:border-ink-700 bg-transparent text-ink-700 dark:text-ink-300 focus:border-ink-900 dark:focus:border-white outline-none"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-32 border border-ink-100 dark:border-ink-800">
              <div className="mb-6">
                <svg className="w-12 h-12 mx-auto text-ink-300 dark:text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-base text-ink-500 dark:text-ink-400 mb-2">{t('shop.noProducts')}</p>
              <p className="text-sm text-ink-400 dark:text-ink-500">{t('shop.tryDifferent')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-ink-100 dark:bg-ink-800">
              {products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-ink-950"
                >
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
