import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import { motion } from 'framer-motion';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const { lang } = useI18n();

  useEffect(() => {
    axios.get(`/api/blog/${slug}`).then(res => setPost(res.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moris-500"></div></div>;

  const title = post.title?.[lang] || post.title?.en || post.title || '';
  const content = post.content?.[lang] || post.content?.en || post.content || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-moris-500 hover:underline mb-6 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Blog
          </Link>
          <article className="card-solid overflow-hidden">
            {post.image && (
              <div className="h-64 md:h-96 overflow-hidden">
                <img src={post.image} alt={title} loading="lazy" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                {post.author && <span className="font-medium text-moris-500">By {post.author}</span>}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.tags?.length > 0 && post.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-moris-100 dark:bg-moris-900/30 text-moris-600 dark:text-moris-400 text-xs">{tag}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-gradient mb-6">{title}</h1>
              <div className="prose prose-gray dark:prose-invert max-w-none leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{content}</div>
            </div>
          </article>
        </motion.div>
      </div>
    </div>
  );
}
