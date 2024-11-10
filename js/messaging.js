// Core messaging functionality
export async function sendMessage(senderId, recipientId, content) {
  try {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const sender = users.find(u => u.id === senderId);
    const recipient = users.find(u => u.id === recipientId);
    
    if (!sender || !recipient) throw new Error('User not found');

    const newMessage = {
      id: Date.now().toString(),
      senderId,
      recipientId,
      content,
      date: new Date().toISOString(),
      read: false
    };
    
    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    createNotification(recipientId, 'رسالة جديدة', `رسالة جديدة من ${sender.name}`);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

function createNotification(userId, title, message) {
  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      userId,
      title,
      message,
      date: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export function getMessages(userId) {
  try {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    return messages.filter(msg => msg.senderId === userId || msg.recipientId === userId);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}