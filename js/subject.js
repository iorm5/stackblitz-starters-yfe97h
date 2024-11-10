import { showError } from './utils/notifications.js';

let currentSubject = '';
const subjectTitles = {
    'math': 'الرياضيات',
    'science': 'العلوم',
    'english': 'اللغة الإنجليزية',
    'arabic': 'اللغة العربية'
};

const subjectDescriptions = {
    'math': 'معلمو الرياضيات المتخصصون في الجبر، الهندسة، والحساب',
    'science': 'نخبة من معلمي العلوم المتخصصين في الفيزياء، الكيمياء، والأحياء. اختر معلمك المفضل وابدأ رحلة اكتشاف عالم العلوم',
    'english': 'معلمو اللغة الإنجليزية المتخصصون في القواعد، المحادثة، والكتابة',
    'arabic': 'نخبة من معلمي اللغة العربية المتخصصين في النحو، الأدب، والبلاغة'
};

const specialtyNames = {
    'physics': 'فيزياء',
    'chemistry': 'كيمياء',
    'biology': 'أحياء'
};

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

function initializePage() {
    // Get subject from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentSubject = urlParams.get('subject');

    if (!currentSubject || !subjectTitles[currentSubject]) {
        window.location.href = '/';
        return;
    }

    // Set page title and description
    document.title = `معلمو ${subjectTitles[currentSubject]} - معلمك`;
    document.getElementById('subjectTitle').textContent = `معلمو ${subjectTitles[currentSubject]}`;
    document.getElementById('subjectDescription').textContent = subjectDescriptions[currentSubject];

    // Initialize back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Initialize filters
    setupFilters();

    // Load initial teachers
    loadTeachers();
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const cityFilter = document.getElementById('cityFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const ratingFilter = document.getElementById('ratingFilter');

    // Apply filters on change
    searchInput.addEventListener('input', debounce(loadTeachers, 300));
    if (specialtyFilter) specialtyFilter.addEventListener('change', loadTeachers);
    cityFilter.addEventListener('change', loadTeachers);
    experienceFilter.addEventListener('change', loadTeachers);
    if (ratingFilter) ratingFilter.addEventListener('change', loadTeachers);
}

async function loadTeachers() {
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
    const specialtyFilter = document.getElementById('specialtyFilter')?.value;
    const cityFilter = document.getElementById('cityFilter').value;
    const experienceFilter = document.getElementById('experienceFilter').value;

    try {
        // Get teachers from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Filter teachers
        const teachers = users.filter(user => {
            if (user.accountType !== 'teacher') return false;
            if (user.subject !== currentSubject) return false;
            
            // Only show teachers with rating > 2
            const rating = parseFloat(user.rating) || 0;
            if (rating <= 2) return false;
            
            // Apply search filter
            if (searchQuery && !user.name.toLowerCase().includes(searchQuery)) return false;
            
            // Apply specialty filter
            if (specialtyFilter && user.specialty !== specialtyFilter) return false;
            
            // Apply city filter
            if (cityFilter && user.city !== cityFilter) return false;
            
            // Apply experience filter
            if (experienceFilter) {
                const experience = parseInt(user.experience) || 0;
                if (experienceFilter === '0-2' && (experience < 0 || experience > 2)) return false;
                if (experienceFilter === '3-5' && (experience < 3 || experience > 5)) return false;
                if (experienceFilter === '5+' && experience <= 5) return false;
            }
            
            return true;
        });

        // Sort teachers by rating (highest first)
        teachers.sort((a, b) => {
            const ratingA = parseFloat(a.rating) || 0;
            const ratingB = parseFloat(b.rating) || 0;
            return ratingB - ratingA;
        });

        displayTeachers(teachers);
    } catch (error) {
        console.error('Error loading teachers:', error);
        showError('حدث خطأ أثناء تحميل بيانات المعلمين');
    }
}

function displayTeachers(teachers) {
    const container = document.getElementById('teachersList');
    
    if (!teachers.length) {
        container.innerHTML = '<p class="no-results">لا يوجد معلمين متميزين متاحين حالياً</p>';
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
            <p class="teacher-info">${teacher.city}</p>
            ${teacher.specialty ? `
                <span class="teacher-specialty">${specialtyNames[teacher.specialty]}</span>
            ` : ''}
            <span class="teacher-experience">${teacher.experience} سنوات خبرة</span>
            <div class="teacher-rating">
                ${generateStars(teacher.rating || 4.5)}
                <span>(${teacher.rating || 4.5})</span>
            </div>
            <div class="teacher-price">${teacher.price || 15} ر.ع/ساعة</div>
            <button 
                onclick="contactTeacher('${teacher.id}')" 
                class="contact-btn"
            >تواصل مع المعلم</button>
        </div>
    `).join('');
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
window.contactTeacher = function(teacherId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }
    
    // For now, just show an alert
    alert('سيتم تفعيل نظام المراسلة قريباً');
};