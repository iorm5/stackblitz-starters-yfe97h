import { getCurrentUser, logout, checkAuth, updateUserProfile } from './auth.js';
import { showError, showSuccess } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  
  const user = getCurrentUser();
  initializeProfile(user);
  setupEventListeners();
});

function initializeProfile(user) {
  const elements = {
    name: document.getElementById('profileName'),
    email: document.getElementById('profileEmail'),
    phone: document.getElementById('profilePhone'),
    type: document.getElementById('profileType'),
    subject: document.getElementById('profileSubject'),
    bio: document.getElementById('profileBio'),
    teacherInfo: document.getElementById('teacherOnlyInfo'),
    bioText: document.getElementById('bioText')
  };

  elements.name.textContent = user.name;
  elements.email.textContent = user.email;
  elements.phone.textContent = user.phone;
  elements.type.textContent = user.type === 'teacher' ? 'معلم' : 'طالب';

  if (user.type === 'teacher') {
    elements.teacherInfo.classList.remove('hidden');
    elements.subject.textContent = getSubjectName(user.subject);
    elements.bio.textContent = user.bio || 'لا يوجد نبذة';
    elements.bioText.value = user.bio || '';
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');
  const editBioBtn = document.getElementById('editBioBtn');
  const bioEditModal = document.getElementById('bioEditModal');
  const bioEditForm = document.getElementById('bioEditForm');
  const closeBtn = bioEditModal.querySelector('.close');

  logoutBtn.addEventListener('click', logout);

  editBioBtn.addEventListener('click', () => {
    bioEditModal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    bioEditModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === bioEditModal) {
      bioEditModal.style.display = 'none';
    }
  });

  bioEditForm.addEventListener('submit', handleBioUpdate);
}

async function handleBioUpdate(e) {
  e.preventDefault();
  
  const bioText = document.getElementById('bioText').value.trim();
  const bioModal = document.getElementById('bioEditModal');
  
  if (bioText.length < 10) {
    showError('النبذة يجب أن تكون 10 أحرف على الأقل');
    return;
  }

  const success = updateUserProfile({ bio: bioText });
  
  if (success) {
    document.getElementById('profileBio').textContent = bioText;
    bioModal.style.display = 'none';
    showSuccess('تم تحديث النبذة بنجاح');
  } else {
    showError('حدث خطأ أثناء تحديث النبذة');
  }
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