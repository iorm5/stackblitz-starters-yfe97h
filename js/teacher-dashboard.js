import { showError, showSuccess } from './utils/notifications.js';
import { initializeNavigation } from './dashboard/navigation.js';
import { loadMessages, displayMessages, updateMessageCount } from './dashboard/messages.js';
import { loadNotifications, displayNotifications, updateNotificationCount } from './dashboard/notifications.js';
import { MessageModal } from './components/MessageModal.js';
import { sendMessage } from './messaging.js';
import { checkAuth, handleLogout } from './dashboard/auth.js';
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
    if (currentUser.accountType !== 'teacher') {
      window.location.href = '/login.html';
      return;
    }

    // Initialize UI
    initializeNavigation();
    setupEventListeners();
    loadUserProfile(currentUser);

    // Load all data concurrently
    const [messages, notifications] = await Promise.all([
      loadMessages(currentUser.id),
      loadNotifications(currentUser.id)
    ]);

    // Update UI with loaded data
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

// Global functions for event handlers
window.viewConversation = async function(userId) {
  if (!currentUser) {
    window.location.href = '/login.html';
    return;
  }
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const student = users.find(u => u.id === userId);
    
    if (!student) {
      showError('لم يتم العثور على الطالب');
      return;
    }

    const messages = JSON.parse(localStorage.getItem('messages') || '[]')
      .filter(msg => 
        (msg.senderId === currentUser.id && msg.recipientId === userId) ||
        (msg.senderId === userId && msg.recipientId === currentUser.id)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const modal = new MessageModal(userId, student.name);
    modal.setOnSend(async (content) => {
      try {
        const success = await sendMessage(currentUser.id, userId, content);
        if (success) {
          showSuccess('تم إرسال الرسالة بنجاح');
          // Refresh messages
          const updatedMessages = await loadMessages(currentUser.id);
          displayMessages(updatedMessages);
          updateMessageCount(updatedMessages);
        } else {
          showError('حدث خطأ أثناء إرسال الرسالة');
        }
      } catch (error) {
        showError('حدث خطأ أثناء إرسال الرسالة');
      }
    });
    modal.show();
  } catch (error) {
    showError('حدث خطأ أثناء محاولة عرض المحادثة');
  }
};

window.replyToMessage = function(userId) {
  viewConversation(userId);
};