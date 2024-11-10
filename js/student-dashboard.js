import { showError, showSuccess } from './utils/notifications.js';
import { initializeNavigation } from './dashboard/navigation.js';
import { loadMessages, displayMessages, updateMessageCount } from './dashboard/messages.js';
import { loadNotifications, displayNotifications, updateNotificationCount } from './dashboard/notifications.js';
import { MessageModal } from './components/MessageModal.js';
import { sendMessage } from './messaging.js';
import { checkAuth, handleLogout } from './dashboard/auth.js';
import { loadTeachers, generateStars, getSubjectName, getSpecialtyName, getCityName } from './dashboard/teachers.js';
import { updateProfile, handleProfileImageUpload, loadUserProfile } from './dashboard/profile.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initializeDashboard();
});

async function initializeDashboard() {
  try {
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser) return;

    // Validate user type
    if (currentUser.accountType !== 'student') {
      window.location.href = '/login.html';
      return;
    }

    // Initialize UI
    initializeNavigation();
    setupEventListeners();
    loadUserProfile(currentUser);

    // Load all data concurrently
    const [teachers, messages, notifications] = await Promise.all([
      loadTeachers(),
      loadMessages(currentUser.id),
      loadNotifications(currentUser.id)
    ]);

    // Update UI with loaded data
    displayTeachers(teachers);
    displayMessages(messages);
    updateMessageCount(messages);
    displayNotifications(notifications);
    updateNotificationCount(notifications);

  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('حدث خطأ أثناء تحميل البيانات. يرجى تحديث الصفحة.');
  }
}

function setupEventListeners() {
  // Search filters
  const searchInput = document.getElementById('searchInput');
  const subjectFilter = document.getElementById('subjectFilter');
  const cityFilter = document.getElementById('cityFilter');
  const ratingFilter = document.getElementById('ratingFilter');

  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
  if (subjectFilter) {
    subjectFilter.addEventListener('change', handleSearch);
  }
  if (cityFilter) {
    cityFilter.addEventListener('change', handleSearch);
  }
  if (ratingFilter) {
    ratingFilter.addEventListener('change', handleSearch);
  }

  // Profile Image
  const editProfileBtn = document.getElementById('editProfileImage');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      handleProfileImageUpload(currentUser, (updatedUser) => {
        currentUser = updatedUser;
        loadUserProfile(currentUser);
      });
    });
  }

  // Profile Form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const profileData = Object.fromEntries(formData.entries());

      try {
        const updatedUser = await updateProfile(currentUser, profileData);
        currentUser = updatedUser;
        loadUserProfile(currentUser);
        showSuccess('تم تحديث الملف الشخصي بنجاح');
      } catch (error) {
        showError('حدث خطأ أثناء تحديث الملف الشخصي');
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

async function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const subjectFilter = document.getElementById('subjectFilter');
  const cityFilter = document.getElementById('cityFilter');
  const ratingFilter = document.getElementById('ratingFilter');

  const filters = {
    query: searchInput?.value?.trim() || '',
    subject: subjectFilter?.value || '',
    city: cityFilter?.value || '',
    rating: ratingFilter?.value || ''
  };

  const teachers = await loadTeachers(filters);
  displayTeachers(teachers);
}

function displayTeachers(teachers) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  if (!teachers.length) {
    container.innerHTML = '<p class="no-results">لم يتم العثور على معلمين</p>';
    return;
  }

  container.innerHTML = teachers.map(teacher => `
    <div class="teacher-card">
      <img 
        src="${teacher.profileImage || '/images/default-avatar.png'}" 
        alt="${teacher.name}"
        class="teacher-image"
      >
      <h3 class="teacher-name">${teacher.name}</h3>
      <p class="teacher-subject">${getSubjectName(teacher.subject)}</p>
      ${teacher.specialty ? `
        <span class="teacher-specialty">${getSpecialtyName(teacher.specialty)}</span>
      ` : ''}
      <div class="teacher-location">
        <i class="icon-location"></i>
        <span>${getCityName(teacher.city)}</span>
      </div>
      <span class="teacher-experience">${teacher.experience || 0} سنوات خبرة</span>
      <div class="teacher-rating">
        ${generateStars(teacher.rating || 4.5)}
        <span>(${teacher.rating || 4.5})</span>
      </div>
      <p class="teacher-bio">${teacher.bio || 'لا توجد نبذة تعريفية'}</p>
      <p class="teacher-price">${teacher.price || 15} ر.ع/ساعة</p>
      <button onclick="contactTeacher('${teacher.id}')" class="contact-btn">
        تواصل مع المعلم
      </button>
    </div>
  `).join('');
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

// Global functions for event handlers
window.contactTeacher = async function(teacherId) {
  if (!currentUser) {
    window.location.href = '/login.html';
    return;
  }
  
  try {
    const usersData = localStorage.getItem('users');
    if (!usersData) throw new Error('No users data found');

    const users = JSON.parse(usersData);
    const teacher = users.find(u => u.id === teacherId);
    
    if (!teacher) {
      showError('لم يتم العثور على المعلم');
      return;
    }

    const modal = new MessageModal(teacherId, teacher.name);
    modal.setOnSend(async (content) => {
      try {
        const success = await sendMessage(currentUser.id, teacherId, content);
        if (success) {
          showSuccess('تم إرسال الرسالة بنجاح');
          // Refresh messages
          const messages = await loadMessages(currentUser.id);
          displayMessages(messages);
          updateMessageCount(messages);
        } else {
          showError('حدث خطأ أثناء إرسال الرسالة');
        }
      } catch (error) {
        showError('حدث خطأ أثناء إرسال الرسالة');
      }
    });
    modal.show();
  } catch (error) {
    showError('حدث خطأ أثناء محاولة التواصل مع المعلم');
  }
};