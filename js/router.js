export function navigateTo(path) {
  window.location.href = path;
}

export function getCurrentPath() {
  return window.location.pathname;
}

export function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === getCurrentPath()) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}