// PWA Registration and Install Prompt Handler
(function() {
  'use strict';

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker updated');
        // Optionally show update notification
        if (window.confirm('A new version is available! Reload to update?')) {
          window.location.reload();
        }
      });
    });
  }

  // Handle install prompt
  let deferredPrompt;
  const installButton = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Install prompt available');
    
    // Show install button if it exists
    if (installButton) {
      installButton.style.display = 'block';
    }
  });

  // Install button click handler
  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) {
        return;
      }

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      
      if (installButton) {
        installButton.style.display = 'none';
      }
    });
  }

  // Handle app installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
    if (installButton) {
      installButton.style.display = 'none';
    }
  });

  // Detect if app is running in standalone mode
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  
  if (isStandalone) {
    console.log('[PWA] App running in standalone mode');
    document.documentElement.classList.add('pwa-standalone');
  }

  // Handle online/offline status
  window.addEventListener('online', () => {
    console.log('[PWA] App is online');
    document.documentElement.classList.remove('pwa-offline');
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] App is offline');
    document.documentElement.classList.add('pwa-offline');
  });

  // Expose PWA API globally
  window.PWA = {
    isStandalone,
    isOnline: navigator.onLine,
    showInstallPrompt: () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      }
    }
  };
})();
