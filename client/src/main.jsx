import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-outline, .btn-danger, .btn-ghost');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  ripple.className = 'ripple-effect';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <SocketProvider>
                <SiteConfigProvider>
                  <ErrorBoundary>
                    <App />
                  </ErrorBoundary>
                  <Toaster position="top-center" toastOptions={{ style: { borderRadius: '16px', padding: '16px' } }} />
                </SiteConfigProvider>
              </SocketProvider>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
