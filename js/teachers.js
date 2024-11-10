import { showError, showSuccess } from './utils.js';
import { sendMessage } from './messaging.js';
import { MessageModal } from './components/MessageModal.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeTeachersPage();
});

async function initializeTeachersPage() {
    setupBackButton();
    setupFilters();
    await loadTeachers();
}

function setupBackButton() {
    const backButton = document.querySelector('.back-btn');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const subjectFilter = document.getElementById('subjectFilter');
    const cityFilter = document.getElementById('cityFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const experienceFilter = document.getElementById('experienceFilter');

    // Add event listeners
    searchInput?.addEventListener('input', debounce(handleFilters, 300));
    subjectFilter?.addEventListener('change', handleFilters);
    cityFilter?.addEventListener('change', handleFilters);
    ratingFilter?.addEventListener('change', handleFilters);
    experienceFilter?.addEventListener('change', handleFilters);
}

async function loadTeachers(filters = {}) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let teachers = users.filter(user => user.accountType === 'teacher');

        // Apply filters
        if (filters.query) {
            const query = filters.query.toLowerCase();
            teachers = teachers.filter(teacher => 
                teacher.name.toLowerCase().includes(query) ||
                teacher.subject.toLowerCase().includes(query)
            );
        }

        if (filters.subject) {
            teachers = teachers.filter(teacher => teacher.subject === filters.subject);
        }

        if (filters.city) {
            teachers = teachers.filter(teacher => teacher.city === filters.city);
        }

        if (filters.rating) {
            const minRating = parseFloat(filters.rating);
            teachers = teachers.filter(teacher => (teacher.rating || 0) >= minRating);
        }

        if (filters.experience) {
            teachers = teachers.filter(teacher => {
                const experience = parseInt(teacher.experience) || 0;
                if (filters.experience === '0-2') return experience >= 0 && experience <= 2;
                if (filters.experience === '3-5') return experience >= 3 && experience <= 5;
                if (filters.experience === '5+') return experience > 5;
                return true;
            });
        }

        // Sort by rating (highest first)
        teachers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        displayTeachers(teachers);
    } catch (error) {
        console.error('Error loading teachers:', error);
        showError('حدث خطأ أثناء تحميل بيانات المعلمين');
    }
}

function displayTeachers(teachers) {
    const container = document.getElementById('teachersGrid');
    if (!container) return;

    if (teachers.length === 0) {
        container.innerHTML = '<p class="no-results">لم يتم العثور على معلمين</p>';
        return;
    }

    container.innerHTML = teachers.map(teacher => `
        <div class="teacher-card">
            <img 
                src="${teacher.profileImage || '/images/default-avatar.png'}" 
                alt="${teacher.name}"
                class="teacher-image"
            >
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-subject">${getSubjectName(teacher.subject)}</p>
            <div class="teacher-location">
                <i class="icon-location"></i>
                <span>${getCityName(teacher.city)}</span>
            </div>
            <span class="teacher-experience">${teacher.experience || 0} سنوات خبرة</span>
            <div class="teacher-rating">
                ${generateStars(teacher.rating || 4.5)}
                <span>(${teacher.rating || 4.5})</span>
            </div>
            <p class="teacher-bio">${teacher.bio || 'لا توجد نبذة تعريفية'}</p>
            <p class="teacher-price">${teacher.price || 15} ر.ع/ساعة</p>
            <button 
                onclick="contactTeacher('${teacher.id}')" 
                class="contact-btn"
            >
                تواصل مع المعلم
            </button>
        </div>
    `).join('');
}

function handleFilters() {
    const filters = {
        query: document.getElementById('searchInput')?.value?.trim(),
        subject: document.getElementById('subjectFilter')?.value,
        city: document.getElementById('cityFilter')?.value,
        rating: document.getElementById('ratingFilter')?.value,
        experience: document.getElementById('experienceFilter')?.value
    };

    loadTeachers(filters);
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
        ${'★'.repeat(fullStars)}
        ${hasHalfStar ? '⯨' : ''}
        ${'☆'.repeat(emptyStars)}
    `;
}

function getSubjectName(subjectKey) {
    const subjects = {
        math: 'رياضيات',
        science: 'علوم',
        english: 'لغة إنجليزية',
        arabic: 'لغة عربية'
    };
    return subjects[subjectKey] || subjectKey;
}

function getCityName(cityKey) {
    const cities = {
        muscat: 'مسقط',
        salalah: 'صلالة',
        sohar: 'صحار',
        nizwa: 'نزوى'
    };
    return cities[cityKey] || cityKey;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global function for contacting teachers
window.contactTeacher = async function(teacherId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const teacher = users.find(u => u.id === teacherId);
        
        if (!teacher) {
            showError('لم يتم العثور على المعلم');
            return;
        }

        // Create and show message modal
        const messageModal = new MessageModal(teacherId, teacher.name);
        messageModal.setOnSend(async (content) => {
            const success = await sendMessage(currentUser.id, teacherId, content);
            if (success) {
                showSuccess('تم إرسال الرسالة بنجاح');
            } else {
                showError('حدث خطأ أثناء إرسال الرسالة');
            }
        });
        messageModal.show();
    } catch (error) {
        console.error('Error contacting teacher:', error);
        showError('حدث خطأ أثناء محاولة التواصل مع المعلم');
    }
};