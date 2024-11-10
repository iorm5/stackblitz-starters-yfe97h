import { showError, showSuccess } from './utils.js';
import { validatePhone } from './utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeLoginForm();
});

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    const identifierInput = document.getElementById('identifier');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const backButton = document.querySelector('.back-btn');
    
    if (!form || !identifierInput || !passwordInput) {
        console.error('Required elements not found');
        return;
    }

    // Handle back button
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.querySelector('i').classList.toggle('icon-eye');
            togglePassword.querySelector('i').classList.toggle('icon-eye-off');
        });
    }

    // Initialize phone validation
    if (identifierInput) {
        identifierInput.addEventListener('input', (e) => {
            if (e.target.value.startsWith('00968')) {
                validatePhoneInput(e.target);
            }
        });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const identifier = identifierInput.value.trim();
        const password = passwordInput.value;
        
        // Basic validation
        if (!identifier || !password) {
            showError('جميع الحقول مطلوبة');
            return;
        }

        try {
            const success = await handleLogin(identifier, password);
            if (success) {
                showSuccess('تم تسجيل الدخول بنجاح');
                redirectToDashboard();
            }
        } catch (error) {
            showError('حدث خطأ أثناء تسجيل الدخول');
        }
    });
}

function validatePhoneInput(input) {
    let value = input.value;
    value = value.replace(/[^\d]/g, '');
    value = value.slice(0, 13);
    input.value = value;
}

async function handleLogin(identifier, password) {
    try {
        // Get registered users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user with matching identifier (phone or name) and password
        const user = users.find(u => {
            const matchesPhone = validatePhone(identifier) && u.phone === identifier;
            const matchesName = !validatePhone(identifier) && u.name?.toLowerCase() === identifier.toLowerCase();
            return (matchesPhone || matchesName) && u.password === password;
        });
        
        if (user) {
            // Store current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        } else {
            showError('بيانات الدخول غير صحيحة');
            return false;
        }
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('حدث خطأ أثناء تسجيل الدخول');
    }
}

function redirectToDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    // Redirect based on user type after a short delay
    setTimeout(() => {
        if (user.accountType === 'teacher') {
            window.location.href = '/teacher-dashboard.html';
        } else {
            window.location.href = '/student-dashboard.html';
        }
    }, 1000);
}