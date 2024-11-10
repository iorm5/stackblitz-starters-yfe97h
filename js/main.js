// Main page functionality
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  setupEventListeners();
});

function initializeNavigation() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function setupEventListeners() {
  // Auth buttons
  const loginBtn = document.querySelector('.login-btn');
  const registerBtn = document.querySelector('.register-btn');
  const registerTeacherBtn = document.querySelector('.register-teacher-btn');
  const registerBtnLarge = document.querySelector('.register-btn-large');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = '/login.html';
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      window.location.href = '/register-type.html';
    });
  }

  if (registerTeacherBtn) {
    registerTeacherBtn.addEventListener('click', () => {
      window.location.href = '/register.html?type=teacher';
    });
  }

  if (registerBtnLarge) {
    registerBtnLarge.addEventListener('click', () => {
      window.location.href = '/register.html?type=student';
    });
  }

  // Subject cards
  document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const subject = card.getAttribute('href').split('/').pop();
      window.location.href = `/subject.html?subject=${subject}`;
    });
  });

  // Search functionality
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-input');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }
}