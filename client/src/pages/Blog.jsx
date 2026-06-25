import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import { motion } from 'framer-motion';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const { lang } = useI18n();

  useEffect(() => { axios.get('/api/blog').then(res => setPosts(res.data.posts || res.data)).catch(() => {}); }, []);

  const getTitle = (post) => post.title?.[lang] || post.title?.en || post.title || '';
  const getDescription = (post) => post.description?.[lang] || post.description?.en || post.description || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-gradient mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
            Blog
          </h1>
          {posts.length === 0 ? (
            <div className="card-solid text-center py-20">
              <div className="text-6xl mb-6">📝</div>
              <p className="text-xl text-gray-500">No blog posts yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.div key={post._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Link to={`/blog/${post.slug}`} className="card overflow-hidden h-full group block">
                    <div className="relative h-48 overflow-hidden">
                      {post.image ? (
                        <img src={post.image} alt={getTitle(post)} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-moris-500/20 to-orange-500/20 flex items-center justify-center text-4xl">📰</div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.tags?.length > 0 && post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-moris-100 dark:bg-moris-900/30 text-moris-600 dark:text-moris-400">{tag}</span>
                        ))}
                      </div>
                      <h2 className="font-bold text-lg mb-2 group-hover:text-moris-600 dark:group-hover:text-moris-400 transition-colors">{getTitle(post)}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{getDescription(post)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
