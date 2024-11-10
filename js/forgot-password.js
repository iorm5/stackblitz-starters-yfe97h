import { validatePassword } from './utils/validation.js';
import { showError, showSuccess } from './utils.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeRecoveryForm();
});

function initializeRecoveryForm() {
    const recoveryForm = document.getElementById('recoveryForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    const backButton = document.querySelector('.back-btn');

    // Handle back button
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Initialize phone validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value;
            if (!value.startsWith('00968')) {
                value = '00968';
            }
            value = value.replace(/[^\d]/g, '');
            value = value.slice(0, 13);
            e.target.value = value;
        });
    }

    // Recovery form submission
    recoveryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('phone').value.trim();
        const securityAnswer = document.getElementById('securityAnswer')?.value?.trim();

        try {
            if (!currentUser) {
                // First step: Find user and show security question
                const user = await findUserByPhone(phone);
                if (!user) {
                    showError('رقم الهاتف غير مسجل في النظام');
                    return;
                }
                currentUser = user;
                showSecurityQuestion(user.securityQuestion);
                return;
            }

            // Second step: Verify security answer
            if (securityAnswer.toLowerCase() === currentUser.securityAnswer.toLowerCase()) {
                showNewPasswordForm();
            } else {
                showError('إجابة سؤال الأمان غير صحيحة');
            }
        } catch (error) {
            showError(error.message);
        }
    });

    // New password form submission
    newPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!validatePassword(newPassword)) {
            showError('كلمة المرور يجب أن تكون 5 أحرف على الأقل');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('كلمات المرور غير متطابقة');
            return;
        }

        try {
            await updatePassword(newPassword);
            showSuccess('تم تغيير كلمة المرور بنجاح');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } catch (error) {
            showError(error.message);
        }
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggle.querySelector('i').classList.toggle('icon-eye');
            toggle.querySelector('i').classList.toggle('icon-eye-off');
        });
    });
}

async function findUserByPhone(phone) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.phone === phone);
}

function showSecurityQuestion(question) {
    const securitySection = document.getElementById('securitySection');
    const securityQuestion = document.getElementById('securityQuestion');
    const phoneInput = document.getElementById('phone');
    const submitButton = document.querySelector('#recoveryForm button[type="submit"]');
    
    securitySection.classList.remove('hidden');
    securityQuestion.textContent = question;
    phoneInput.disabled = true;
    submitButton.textContent = 'تحقق من الإجابة';
}

function showNewPasswordForm() {
    document.getElementById('recoveryForm').classList.add('hidden');
    document.getElementById('newPasswordForm').classList.remove('hidden');
}

async function updatePassword(newPassword) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.phone === currentUser.phone);
        
        if (userIndex === -1) {
            throw new Error('المستخدم غير موجود');
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        throw new Error('حدث خطأ أثناء تحديث كلمة المرور');
    }
}