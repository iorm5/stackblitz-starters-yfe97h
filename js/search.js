import { checkAuth, getCurrentUser, logout } from './auth.js';
import { initializeNavigation } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  
  initializeNavigation();
  setupSearchHandlers();
  
  // Initial search
  searchTeachers();
});

function setupSearchHandlers() {
  const logoutBtn = document.getElementById('logoutBtn');
  const searchBtn = document.getElementById('searchBtn');
  const subjectFilter = document.getElementById('subjectFilter');
  const locationFilter = document.getElementById('locationFilter');
  
  logoutBtn.addEventListener('click', logout);
  
  // Real-time search as user types or changes filters
  subjectFilter.addEventListener('change', debounce(handleSearch, 300));
  locationFilter.addEventListener('input', debounce(handleSearch, 300));
  searchBtn.addEventListener('click', handleSearch);
}

function handleSearch() {
  const subject = document.getElementById('subjectFilter').value;
  const location = document.getElementById('locationFilter').value.trim().toLowerCase();
  searchTeachers(subject, location);
}

function searchTeachers(subject = '', location = '') {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const teachers = users.filter(user => {
    const isTeacher = user.type === 'teacher';
    const matchesSubject = !subject || user.subject === subject;
    const matchesLocation = !location || 
      (user.location && user.location.toLowerCase().includes(location));
    
    return isTeacher && matchesSubject && matchesLocation;
  });
  
  displayTeachers(teachers);
}

function displayTeachers(teachers) {
  const teachersGrid = document.getElementById('teachersGrid');
  teachersGrid.innerHTML = '';
  
  if (teachers.length === 0) {
    teachersGrid.innerHTML = '<p class="no-results">لم يتم العثور على معلمين</p>';
    return;
  }
  
  teachers.forEach(teacher => {
    const teacherCard = document.createElement('div');
    teacherCard.className = 'teacher-card';
    teacherCard.innerHTML = `
      <h3>${teacher.name}</h3>
      <p class="subject">${getSubjectName(teacher.subject)}</p>
      <p class="bio">${teacher.bio || 'لا يوجد نبذة'}</p>
      <button class="contact-btn" onclick="contactTeacher('${teacher.email}')">
        تواصل مع المعلم
      </button>
    `;
    teachersGrid.appendChild(teacherCard);
  });
}

function getSubjectName(subjectKey) {
  const subjects = {
    math: 'رياضيات',
    science: 'علوم',
    english: 'لغة إنجليزية',
    arabic: 'لغة عربية'
  };
  return subjects[subjectKey] || subjectKey;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.contactTeacher = function(email) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    window.location.href = '/';
    return;
  }
  
  // For now, just show an alert. In a real app, this would open a chat or messaging interface
  alert(`سيتم تفعيل نظام المراسلة قريباً. يمكنك التواصل مع المعلم عبر البريد: ${email}`);
};