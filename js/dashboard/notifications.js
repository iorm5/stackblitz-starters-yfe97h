import { showError } from '../utils/notifications.js';

export async function loadNotifications(userId) {
  try {
    const notificationsData = localStorage.getItem('notifications');
    if (!notificationsData) return [];

    const notifications = JSON.parse(notificationsData);
    return notifications.filter(notif => notif.userId === userId);
  } catch (error) {
    console.error('Error loading notifications:', error);
    showError('حدث خطأ أثناء تحميل التنبيهات');
    return [];
  }
}

export function displayNotifications(notifications, containerId = 'notificationsList') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!notifications.length) {
    container.innerHTML = '<p class="no-results">لا توجد تنبيهات جديدة</p>';
    return;
  }

  container.innerHTML = notifications.map(notification => `
    <div class="notification ${notification.read ? '' : 'unread'}">
      <div class="notification-header">
        <span class="notification-type">${getNotificationType(notification.type)}</span>
        <span class="notification-date">${formatDate(notification.date)}</span>
      </div>
      <p class="notification-message">${notification.message}</p>
    </div>
  `).join('');
}

export function updateNotificationCount(notifications, badgeId = 'notificationsCount') {
  const badge = document.getElementById(badgeId);
  if (!badge) return;

  const unreadCount = notifications.filter(n => !n.read).length;
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? 'inline' : 'none';
}

function getNotificationType(type) {
  const types = {
    message: 'رسالة جديدة',
    lesson: 'درس جديد',
    reminder: 'تذكير',
    system: 'إشعار نظام'
  };
  return types[type] || 'إشعار';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('ar-OM', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (days === 1) {
    return 'أمس';
  } else if (days < 7) {
    return date.toLocaleDateString('ar-OM', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('ar-OM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}