export class MessageModal {
  constructor(recipientId, recipientName) {
    this.recipientId = recipientId;
    this.recipientName = recipientName;
    this.modal = null;
    this.onSend = null;
    this.create();
  }

  create() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal message-modal';
    
    this.modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${this.recipientName}</h3>
          <button class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="messages-container"></div>
          <form class="message-form">
            <textarea 
              placeholder="اكتب رسالتك هنا..."
              maxlength="500"
              required
            ></textarea>
            <div class="form-actions">
              <button type="submit" class="btn-send">
                <i class="icon-send"></i>
                إرسال
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.setupEventListeners();
    document.body.appendChild(this.modal);
    this.loadMessages();
  }

  setupEventListeners() {
    this.modal.querySelector('.close-btn').onclick = () => this.hide();
    this.modal.querySelector('form').onsubmit = (e) => this.handleSubmit(e);
    this.modal.onclick = (e) => {
      if (e.target === this.modal) this.hide();
    };

    // Auto-resize textarea
    const textarea = this.modal.querySelector('textarea');
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    });
  }

  async loadMessages() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const messages = JSON.parse(localStorage.getItem('messages') || '[]')
      .filter(msg => 
        (msg.senderId === currentUser.id && msg.recipientId === this.recipientId) ||
        (msg.senderId === this.recipientId && msg.recipientId === currentUser.id)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = this.modal.querySelector('.messages-container');
    container.innerHTML = messages.map(msg => this.createMessageElement(msg, currentUser.id)).join('');
    this.scrollToBottom();
  }

  createMessageElement(message, currentUserId) {
    const isSent = message.senderId === currentUserId;
    return `
      <div class="message ${isSent ? 'sent' : 'received'}">
        <div class="bubble">
          <p>${message.content}</p>
          <time>${this.formatTime(message.date)}</time>
        </div>
      </div>
    `;
  }

  formatTime(date) {
    return new Date(date).toLocaleTimeString('ar-OM', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const textarea = this.modal.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content || !this.onSend) return;

    const btn = this.modal.querySelector('.btn-send');
    btn.disabled = true;
    
    try {
      await this.onSend(content);
      textarea.value = '';
      textarea.style.height = 'auto';
      await this.loadMessages();
    } finally {
      btn.disabled = false;
      textarea.focus();
    }
  }

  scrollToBottom() {
    const container = this.modal.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
  }

  show() {
    this.modal.style.display = 'flex';
    this.modal.querySelector('textarea').focus();
  }

  hide() {
    this.modal.style.display = 'none';
    this.modal.querySelector('form').reset();
  }

  setOnSend(callback) {
    this.onSend = callback;
  }
}