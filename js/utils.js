// Message display utilities
export function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.dashboard-content');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

export function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const container = document.querySelector('.dashboard-content');
    if (container) {
        container.insertBefore(successDiv, container.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

// Form validation
export function validateForm(formData) {
    const errors = [];
    
    if (!formData.name?.trim()) {
        errors.push('الاسم مطلوب');
    }
    
    if (!formData.email?.trim()) {
        errors.push('البريد الإلكتروني مطلوب');
    } else if (!validateEmail(formData.email)) {
        errors.push('البريد الإلكتروني غير صحيح');
    }
    
    if (!formData.phone?.trim()) {
        errors.push('رقم الهاتف مطلوب');
    } else if (!validatePhone(formData.phone)) {
        errors.push('رقم الهاتف غير صحيح');
    }
    
    return errors;
}

// Validation helpers
export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
    return /^00968\d{8}$/.test(phone);
}

// Data fetching utilities
export async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Local storage utilities
export function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
    }
}

export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}