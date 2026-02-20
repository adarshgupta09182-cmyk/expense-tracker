// Fix for iOS autofill zoom issue
export const initAutofillFix = () => {
  // Prevent zoom on input focus for iOS
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      // Set font size to 16px to prevent zoom
      input.style.fontSize = '16px';
    });
  });

  // Also handle dynamically added inputs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const inputs = node.querySelectorAll?.('input, textarea, select');
            inputs?.forEach(input => {
              input.style.fontSize = '16px';
              input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
              });
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};
