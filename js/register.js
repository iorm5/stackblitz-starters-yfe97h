document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
});

function initializeForm() {
    const studentForm = document.getElementById('studentForm');
    const teacherForm = document.getElementById('teacherForm');
    const backButton = document.querySelector('.back-btn');
    const registerTitle = document.getElementById('registerTitle');

    if (!studentForm || !teacherForm) {
        console.error('Required forms not found');
        return;
    }

    // Get account type from URL
    const urlParams = new URLSearchParams(window.location.search);
    const accountType = urlParams.get('type');

    // Show appropriate form based on account type
    if (accountType === 'teacher') {
        studentForm.classList.add('hidden');
        teacherForm.classList.remove('hidden');
        registerTitle.textContent = 'تسجيل كمعلم';
    } else {
        studentForm.classList.remove('hidden');
        teacherForm.classList.add('hidden');
        registerTitle.textContent = 'تسجيل كطالب';
    }

    // Handle back button
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/register-type.html';
        });
    }

    // Initialize subject change handlers
    ['student', 'teacher'].forEach(type => {
        const subjectSelect = document.getElementById(`${type}Subject`);
        const specialtyGroup = document.getElementById(`${type}SpecialtyGroup`);
        
        if (subjectSelect && specialtyGroup) {
            subjectSelect.addEventListener('change', () => {
                if (subjectSelect.value === 'science') {
                    specialtyGroup.classList.remove('hidden');
                    document.getElementById(`${type}Specialty`).required = true;
                } else {
                    specialtyGroup.classList.add('hidden');
                    document.getElementById(`${type}Specialty`).required = false;
                    document.getElementById(`${type}Specialty`).value = '';
                }
            });
        }
    });

    // Initialize phone number validation for both forms
    ['studentPhone', 'teacherPhone'].forEach(id => {
        const phoneInput = document.getElementById(id);
        if (phoneInput) {
            initializePhoneValidation(phoneInput);
        }
    });

    // Initialize experience validation
    const experienceInput = document.getElementById('teacherExperience');
    if (experienceInput) {
        experienceInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 0) {
                e.target.value = 0;
            }
        });
    }

    // Form submissions
    studentForm.addEventListener('submit', handleRegistration);
    teacherForm.addEventListener('submit', handleRegistration);
}

function initializePhoneValidation(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value;
        
        // Ensure it starts with 00968
        if (!value.startsWith('00968')) {
            value = '00968';
        }
        
        // Remove any non-digit characters
        value = value.replace(/[^\d]/g, '');
        
        // Limit to 13 digits (00968 + 8 digits)
        value = value.slice(0, 13);
        
        e.target.value = value;
    });
}

async function handleRegistration(e) {
    e.preventDefault();
    
    const form = e.target;
    if (!validateForm(form)) {
        return;
    }

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (!data.phone.match(/^00968[0-9]{8}$/)) {
            showError(form, 'رقم الهاتف غير صحيح');
            return;
        }

        // Validate password match
        if (data.password !== data.confirmPassword) {
            showError(form, 'كلمات المرور غير متطابقة');
            return;
        }

        // Validate subject selection
        if (!data.subject) {
            showError(form, 'يرجى اختيار المادة الدراسية');
            return;
        }

        // Validate specialty if science is selected
        if (data.subject === 'science' && !data.specialty) {
            showError(form, 'يرجى اختيار التخصص');
            return;
        }

        // Validate security question
        if (!data.securityQuestion || !data.securityAnswer.trim()) {
            showError(form, 'يرجى اختيار سؤال الأمان وإدخال الإجابة');
            return;
        }

        // Validate experience for teachers
        if (data.accountType === 'teacher' && (!data.experience || data.experience < 0)) {
            showError(form, 'يرجى إدخال سنوات الخبرة بشكل صحيح');
            return;
        }

        await registerUser(data);
        
        // Redirect to dashboard on success
        window.location.href = data.accountType === 'teacher' 
            ? '/teacher-dashboard.html' 
            : '/student-dashboard.html';

    } catch (error) {
        showError(form, error.message || 'حدث خطأ أثناء التسجيل');
    }
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    if (!isValid) {
        showError(form, 'يرجى ملء جميع الحقول المطلوبة');
    }

    return isValid;
}

function showError(form, message) {
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

async function registerUser(userData) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(user => user.phone === userData.phone || user.email === userData.email)) {
            throw new Error('رقم الهاتف أو البريد الإلكتروني مسجل مسبقاً');
        }
        
        const newUser = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        return newUser;
    } catch (error) {
        throw new Error(error.message || 'حدث خطأ أثناء التسجيل');
    }
}