export function showError(message, duration = 5000) {
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  const container = document.querySelector('.dashboard-content');
  if (container) {
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
      errorDiv.remove();
    }, duration);
  }
}

export function showSuccess(message, duration = 3000) {
  const existingSuccess = document.querySelector('.success-message');
  if (existingSuccess) {
    existingSuccess.remove();
  }

  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  const container = document.querySelector('.dashboard-content');
  if (container) {
    container.insertBefore(successDiv, container.firstChild);
    
    setTimeout(() => {
      successDiv.remove();
    }, duration);
  }
}