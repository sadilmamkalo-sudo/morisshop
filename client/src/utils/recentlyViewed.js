const STORAGE_KEY = 'morisshop_recently_viewed';
const MAX = 12;

export const addRecentlyViewed = (product) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = stored.filter(p => p._id !== product._id);
    filtered.unshift({ _id: product._id, name: product.name, price: product.price, images: product.images, slug: product.slug, category: product.category });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX)));
  } catch {}
};

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
};

export const removeRecentlyViewed = (productId) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.filter(p => p._id !== productId)));
  } catch {}
};
