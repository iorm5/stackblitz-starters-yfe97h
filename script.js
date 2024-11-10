document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === window.location.pathname) {
      link.classList.add('active');
    }
  });

  // Auth buttons
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      window.location.href = 'register-type.html';
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.style.display = 'block';
      }
    });
  }

  // Search functionality
  const searchBtn = document.querySelector('.search-box button');
  const searchInput = document.querySelector('.search-box input');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
});