// Remove autofill styling by cloning and replacing the input
export function removeAutofillStyling(input) {
  if (!input) return;
  
  const value = input.value;
  const type = input.type;
  const name = input.name;
  const placeholder = input.placeholder;
  const className = input.className;
  const id = input.id;
  
  // Create new input without autofill styling
  const newInput = document.createElement('input');
  newInput.type = type;
  newInput.name = name;
  newInput.placeholder = placeholder;
  newInput.className = className;
  newInput.id = id;
  newInput.value = value;
  
  // Copy all attributes
  Array.from(input.attributes).forEach(attr => {
    if (!['type', 'name', 'placeholder', 'class', 'id', 'value'].includes(attr.name)) {
      newInput.setAttribute(attr.name, attr.value);
    }
  });
  
  // Copy event listeners by replacing
  input.parentNode.replaceChild(newInput, input);
  
  return newInput;
}

// Detect and fix autofilled inputs
export function fixAutofill() {
  const inputs = document.querySelectorAll('input');
  
  inputs.forEach(input => {
    // Check if autofilled by looking for the blue background
    const styles = window.getComputedStyle(input);
    const bgColor = styles.backgroundColor;
    
    // If background is not transparent and not our dark theme color, it's autofilled
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      // Check if it's the autofill blue color
      if (bgColor.includes('rgb') && !bgColor.includes('26, 35, 50')) {
        removeAutofillStyling(input);
      }
    }
  });
}

// Monitor for autofill changes
export function monitorAutofill() {
  // Listen for autofill on input change
  document.addEventListener('animationstart', (e) => {
    if (e.animationName === 'onAutoFillStart' && e.target.matches('input')) {
      setTimeout(() => fixAutofill(), 50);
    }
  }, true);
  
  // Also listen for change events
  document.addEventListener('change', (e) => {
    if (e.target.matches('input')) {
      setTimeout(() => fixAutofill(), 50);
    }
  }, true);
}

// Apply fix on page load and periodically
export function initAutofillFix() {
  // Add animation detection for autofill
  const style = document.createElement('style');
  style.textContent = `
    @keyframes onAutoFillStart {
      from { outline: 5px auto -webkit-autofill-notification; }
      to { outline: 5px auto -webkit-autofill-notification; }
    }
    input:-webkit-autofill {
      animation-name: onAutoFillStart;
      animation-fill-mode: both;
    }
  `;
  document.head.appendChild(style);
  
  // Monitor for autofill
  monitorAutofill();
  
  // Check periodically
  const interval = setInterval(() => {
    fixAutofill();
  }, 1000);
  
  // Clean up after 10 seconds
  setTimeout(() => clearInterval(interval), 10000);
}
