// Core application initialization
import { initializeAuth } from './auth.js';
import { initializeNavigation } from './router.js';
import { setupTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize core modules
  initializeAuth();
  initializeNavigation();
  setupTheme();
  
  // Setup global event listeners
  setupGlobalListeners();
});

function setupGlobalListeners() {
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Handle navigation menu for mobile
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.nav-links').classList.toggle('active');
    });
  }
}