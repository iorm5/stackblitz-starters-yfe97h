export function checkAuth() {
  try {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      window.location.href = '/login.html';
      return null;
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error checking auth:', error);
    window.location.href = '/login.html';
    return null;
  }
}

export function handleLogout() {
  try {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Error during logout:', error);
  }
}