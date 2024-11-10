import { showError, showSuccess } from '../utils/notifications.js';
import { MessageModal } from '../components/MessageModal.js';
import { sendMessage } from '../messaging.js';

export async function loadMessages(userId) {
  try {
    const messagesData = localStorage.getItem('messages');
    if (!messagesData) return [];

    const messages = JSON.parse(messagesData);
    return messages.filter(msg => 
      msg.senderId === userId || msg.recipientId === userId
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading messages:', error);
    showError('حدث خطأ أثناء تحميل الرسائل');
    return [];
  }
}

export function displayMessages(messages, containerId = 'messagesList') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!messages.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>لا توجد رسائل</h3>
        <p>عندما تتلقى رسائل، ستظهر هنا</p>
      </div>
    `;
    return;
  }

  // Group messages by conversation
  const conversations = groupMessagesByConversation(messages);

  container.innerHTML = conversations.map(conversation => `
    <div class="message-card ${conversation.unread ? 'unread' : ''}">
      <div class="message-header">
        <div class="message-user">
          <img 
            src="${conversation.otherUser.profileImage || '/images/default-avatar.png'}" 
            alt="${conversation.otherUser.name}"
            class="message-avatar"
          >
          <div class="message-info">
            <h4>${conversation.otherUser.name}</h4>
            <span class="message-date">${formatDate(conversation.lastMessage.date)}</span>
          </div>
        </div>
        <div class="message-actions">
          ${conversation.unread ? '<span class="unread-badge">جديد</span>' : ''}
          <button 
            onclick="deleteConversation('${conversation.otherUser.id}')" 
            class="btn-icon delete-btn" 
            title="حذف المحادثة"
          >
            <i class="icon-trash"></i>
          </button>
        </div>
      </div>
      <div class="message-preview">
        <p>${conversation.lastMessage.content}</p>
      </div>
      <div class="message-footer">
        <button 
          onclick="viewConversation('${conversation.otherUser.id}')" 
          class="btn btn-secondary"
        >
          عرض المحادثة
        </button>
        <button 
          onclick="replyToMessage('${conversation.otherUser.id}')" 
          class="btn btn-primary"
        >
          رد
        </button>
      </div>
    </div>
  `).join('');
}

export function updateMessageCount(messages, badgeId = 'messagesCount') {
  const badge = document.getElementById(badgeId);
  if (!badge) return;

  const unreadCount = messages.filter(msg => !msg.read).length;
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? 'inline' : 'none';
}

export async function deleteConversation(otherUserId) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    // Filter out messages from this conversation
    messages = messages.filter(msg => 
      !(msg.senderId === currentUser.id && msg.recipientId === otherUserId) &&
      !(msg.senderId === otherUserId && msg.recipientId === currentUser.id)
    );
    
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Refresh messages display
    const updatedMessages = await loadMessages(currentUser.id);
    displayMessages(updatedMessages);
    updateMessageCount(updatedMessages);
    
    showSuccess('تم حذف المحادثة بنجاح');
  } catch (error) {
    console.error('Error deleting conversation:', error);
    showError('حدث خطأ أثناء حذف المحادثة');
  }
}

function groupMessagesByConversation(messages) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const conversations = {};

  messages.forEach(message => {
    const otherUserId = message.senderId === currentUser.id ? 
      message.recipientId : message.senderId;
    
    if (!conversations[otherUserId]) {
      const otherUser = users.find(u => u.id === otherUserId);
      conversations[otherUserId] = {
        otherUser,
        messages: [],
        unread: false,
        lastMessage: message
      };
    }
    
    conversations[otherUserId].messages.push(message);
    if (!message.read && message.recipientId === currentUser.id) {
      conversations[otherUserId].unread = true;
    }

    // Update last message if this one is newer
    if (new Date(message.date) > new Date(conversations[otherUserId].lastMessage.date)) {
      conversations[otherUserId].lastMessage = message;
    }
  });

  return Object.values(conversations).sort((a, b) => 
    new Date(b.lastMessage.date) - new Date(a.lastMessage.date)
  );
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

// Global functions for event handlers
window.viewConversation = function(userId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const otherUser = users.find(u => u.id === userId);
  
  if (!otherUser) {
    showError('لم يتم العثور على المستخدم');
    return;
  }

  const modal = new MessageModal(userId, otherUser.name);
  modal.setOnSend(async (content) => {
    try {
      const success = await sendMessage(currentUser.id, userId, content);
      if (success) {
        // Refresh messages list
        const updatedMessages = await loadMessages(currentUser.id);
        displayMessages(updatedMessages);
        updateMessageCount(updatedMessages);
      }
    } catch (error) {
      showError('حدث خطأ أثناء إرسال الرسالة');
    }
  });
  modal.show();
};

window.replyToMessage = function(userId) {
  viewConversation(userId);
};

window.deleteConversation = function(userId) {
  if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
    deleteConversation(userId);
  }
};