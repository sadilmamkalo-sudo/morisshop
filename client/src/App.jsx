import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import { useSiteConfig } from './context/SiteConfigContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SocialButtons from './components/SocialButtons';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Tickets from './pages/Tickets';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminTickets from './pages/admin/AdminTickets';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import AdminReturns from './pages/admin/AdminReturns';
import AdminGiftCards from './pages/admin/AdminGiftCards';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Compare from './pages/Compare';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import StaticPage from './pages/StaticPage';
import Subscription from './pages/Subscription';
import NewsletterSubscribe from './pages/NewsletterSubscribe';
import LiveChatWidget from './components/LiveChatWidget';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminBlog from './pages/admin/AdminBlog';
import AdminBackup from './pages/admin/AdminBackup';
import AdminLiveChat from './pages/admin/AdminLiveChat';
import AdminShipping from './pages/admin/AdminShipping';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminPages from './pages/admin/AdminPages';
import AdminSettings from './pages/admin/AdminSettings';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const { siteName } = useSiteConfig();
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const check = () => {
      fetch('/api/config').then(r => r.ok && setServerReady(true)).catch(() => {
        if (attempts++ < 30) setTimeout(check, 2000);
        else setServerReady(true);
      });
    };
    check();
    const t = setTimeout(check, 1000);
    return () => clearTimeout(t);
  }, []);

  if (!serverReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-ink-950">
        <div className="text-4xl font-display text-ink-900 dark:text-white animate-fade-in mb-4">{siteName}</div>
        <div className="flex items-center gap-2 text-ink-400">
          <div className="w-2 h-2 rounded-full bg-clay-500 animate-pulse"></div>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100 transition-colors duration-300">
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
              <Route path="/shop" element={<AnimatedPage><Shop /></AnimatedPage>} />
              <Route path="/shop/:id" element={<AnimatedPage><ProductDetail /></AnimatedPage>} />
              <Route path="/cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
              <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
              <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
              <Route path="/checkout" element={<AnimatedPage><ProtectedRoute><Checkout /></ProtectedRoute></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProtectedRoute><Profile /></ProtectedRoute></AnimatedPage>} />
              <Route path="/wishlist" element={<AnimatedPage><ProtectedRoute><Wishlist /></ProtectedRoute></AnimatedPage>} />
              <Route path="/orders" element={<AnimatedPage><ProtectedRoute><Orders /></ProtectedRoute></AnimatedPage>} />
              <Route path="/orders/:id" element={<AnimatedPage><ProtectedRoute><OrderDetail /></ProtectedRoute></AnimatedPage>} />
              <Route path="/tickets" element={<AnimatedPage><ProtectedRoute><Tickets /></ProtectedRoute></AnimatedPage>} />
              <Route path="/admin" element={<AnimatedPage><AdminRoute><AdminDashboard /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/products" element={<AnimatedPage><AdminRoute><AdminProducts /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/orders" element={<AnimatedPage><AdminRoute><AdminOrders /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/users" element={<AnimatedPage><AdminRoute><AdminUsers /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/admins" element={<AnimatedPage><AdminRoute><AdminAdmins /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/coupons" element={<AnimatedPage><AdminRoute><AdminCoupons /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/tickets" element={<AnimatedPage><AdminRoute><AdminTickets /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/activity-logs" element={<AnimatedPage><AdminRoute><AdminActivityLogs /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/returns" element={<AnimatedPage><AdminRoute><AdminReturns /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/gift-cards" element={<AnimatedPage><AdminRoute><AdminGiftCards /></AdminRoute></AnimatedPage>} />
              <Route path="/verify-email/:token" element={<AnimatedPage><VerifyEmail /></AnimatedPage>} />
              <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
              <Route path="/reset-password/:token" element={<AnimatedPage><ResetPassword /></AnimatedPage>} />
              <Route path="/compare" element={<AnimatedPage><Compare /></AnimatedPage>} />
              <Route path="/blog" element={<AnimatedPage><Blog /></AnimatedPage>} />
              <Route path="/blog/:slug" element={<AnimatedPage><BlogPost /></AnimatedPage>} />
              <Route path="/page/:slug" element={<AnimatedPage><StaticPage /></AnimatedPage>} />
              <Route path="/subscription" element={<AnimatedPage><ProtectedRoute><Subscription /></ProtectedRoute></AnimatedPage>} />
              <Route path="/newsletter" element={<AnimatedPage><NewsletterSubscribe /></AnimatedPage>} />
              <Route path="/admin/analytics" element={<AnimatedPage><AdminRoute><AdminAnalytics /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/blog" element={<AnimatedPage><AdminRoute><AdminBlog /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/backup" element={<AnimatedPage><AdminRoute><AdminBackup /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/live-chat" element={<AnimatedPage><AdminRoute><AdminLiveChat /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/shipping" element={<AnimatedPage><AdminRoute><AdminShipping /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/newsletter" element={<AnimatedPage><AdminRoute><AdminNewsletter /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/pages" element={<AnimatedPage><AdminRoute><AdminPages /></AdminRoute></AnimatedPage>} />
              <Route path="/admin/settings" element={<AnimatedPage><AdminRoute><AdminSettings /></AdminRoute></AnimatedPage>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <SocialButtons />
        <LiveChatWidget />
        <BackToTop />
      </div>
    </HelmetProvider>
  );
}
