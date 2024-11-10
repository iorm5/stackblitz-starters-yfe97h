export async function loadTeachers(filters = {}) {
  try {
    const teachersData = localStorage.getItem('users');
    if (!teachersData) return [];

    let teachers = JSON.parse(teachersData).filter(user => user.accountType === 'teacher');

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

    // Sort by rating
    return teachers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } catch (error) {
    console.error('Error loading teachers:', error);
    return [];
  }
}

export function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return `
    ${'★'.repeat(fullStars)}
    ${hasHalfStar ? '⯨' : ''}
    ${'☆'.repeat(emptyStars)}
  `;
}

export function getSubjectName(subjectKey) {
  const subjects = {
    math: 'رياضيات',
    science: 'علوم',
    english: 'لغة إنجليزية',
    arabic: 'لغة عربية'
  };
  return subjects[subjectKey] || subjectKey;
}

export function getSpecialtyName(specialtyKey) {
  const specialties = {
    physics: 'فيزياء',
    chemistry: 'كيمياء',
    biology: 'أحياء'
  };
  return specialties[specialtyKey] || specialtyKey;
}

export function getCityName(cityKey) {
  const cities = {
    muscat: 'مسقط',
    salalah: 'صلالة',
    sohar: 'صحار',
    nizwa: 'نزوى'
  };
  return cities[cityKey] || cityKey;
}