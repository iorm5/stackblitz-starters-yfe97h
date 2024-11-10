import { checkAuth, getCurrentUser, logout } from './auth.js';
import { initializeNavigation } from './router.js';
import { showError, validateForm } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  
  initializeNavigation();
  
  const user = getCurrentUser();
  const settingsForm = document.getElementById('settingsForm');
  const teacherSettings = document.getElementById('teacherSettings');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Initialize form with current user data
  document.getElementById('name').value = user.name;
  document.getElementById('email').value = user.email;
  document.getElementById('phone').value = user.phone;
  
  if (user.type === 'teacher') {
    teacherSettings.classList.remove('hidden');
    document.getElementById('subject').value = user.subject;
    document.getElementById('bio').value = user.bio || '';
  }
  
  settingsForm.addEventListener('submit', handleSettingsUpdate);
  logoutBtn.addEventListener('click', logout);
});

function handleSettingsUpdate(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    password: document.getElementById('password').value,
  };
  
  const user = getCurrentUser();
  
  if (user.type === 'teacher') {
    formData.subject = document.getElementById('subject').value;
    formData.bio = document.getElementById('bio').value;
  }
  
  const errors = validateForm({
    ...formData,
    // Don't validate password if it's empty (not being changed)
    password: undefined
  });
  
  if (errors.length > 0) {
    showError(document.querySelector('.error-message'), errors[0]);
    return;
  }
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === user.email);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user data
    const updatedUser = {
      ...users[userIndex],
      ...formData,
      // Only update password if a new one was provided
      password: formData.password || users[userIndex].password
    };
    
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    showSuccess();
  } catch (error) {
    console.error('Error updating settings:', error);
    showError(document.querySelector('.error-message'), 'حدث خطأ أثناء حفظ التغييرات');
  }
}

function showSuccess() {
  const successMessage = document.createElement('div');
  successMessage.className = 'success-message';
  successMessage.textContent = 'تم حفظ التغييرات بنجاح';
  
  document.querySelector('.settings-form').insertBefore(
    successMessage,
    document.querySelector('.form-actions')
  );
  
  setTimeout(() => {
    successMessage.remove();
  }, 3000);
}