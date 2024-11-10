import { showError, validateForm } from './utils.js';

export function handleRegistration(formData) {
  const errors = validateForm(formData);
  
  if (errors.length > 0) {
    showError(errors[0]);
    return false;
  }

  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email or phone already exists
    if (users.some(user => user.email === formData.email || user.phone === formData.phone)) {
      showError('البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً');
      return false;
    }

    users.push(formData);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(formData));
    window.location.href = '/profile.html';
    return true;
  } catch (error) {
    console.error('Error during registration:', error);
    showError('حدث خطأ أثناء التسجيل');
    return false;
  }
}

export function handleLogin(identifier, password) {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => 
      (u.email === identifier || u.phone === identifier || u.name === identifier) && 
      u.password === password
    );
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = '/profile.html';
      return true;
    } else {
      showError('بيانات الدخول غير صحيحة');
    }
    return false;
  } catch (error) {
    console.error('Error during login:', error);
    showError('حدث خطأ أثناء تسجيل الدخول');
    return false;
  }
}

export function getCurrentUser() {
  try {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function logout() {
  try {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  } catch (error) {
    console.error('Error during logout:', error);
    showError('حدث خطأ أثناء تسجيل الخروج');
  }
}

export function checkAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/';
    return false;
  }
  return true;
}

export function updateUserProfile(updatedData) {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = getCurrentUser();
    
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex === -1) throw new Error('User not found');
    
    const updatedUser = { ...users[userIndex], ...updatedData };
    users[userIndex] = updatedUser;
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}