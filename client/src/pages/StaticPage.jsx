import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import { motion } from 'framer-motion';

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const { lang } = useI18n();

  useEffect(() => {
    axios.get(`/api/pages/${slug}`).then(res => setPage(res.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, [slug]);

  if (!page) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moris-500"></div></div>;

  const title = page.title?.[lang] || page.title?.en || page.title || '';
  const content = page.content?.[lang] || page.content?.en || page.content || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <article className="card-solid p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gradient mb-6">{title}</h1>
            <div className="prose prose-gray dark:prose-invert max-w-none leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{content}</div>
          </article>
        </motion.div>
      </div>
    </div>
  );
}
