import { useEffect, useState } from 'react';
import './PWAInstallPrompt.css';

const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed or user dismissed before
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('pwa-prompt-dismissed')) return;
    if (!isMobile()) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShowPrompt(false));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleLater = () => {
    localStorage.setItem('pwa-prompt-dismissed', '1');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">📱</div>
        <div className="pwa-install-text">
          <h3>Install App</h3>
          <p>Add Expense Tracker to your home screen for quick access</p>
        </div>
        <div className="pwa-install-actions">
          <button className="pwa-install-btn-primary" onClick={handleInstall}>Install</button>
          <button className="pwa-install-btn-secondary" onClick={handleLater}>Later</button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
