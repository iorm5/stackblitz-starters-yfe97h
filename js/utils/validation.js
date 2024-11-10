export function validateProfileData(data) {
  const errors = [];

  // Name validation
  if (!data.name?.trim()) {
    errors.push('الاسم مطلوب');
  }

  // Email validation
  if (!data.email?.trim()) {
    errors.push('البريد الإلكتروني مطلوب');
  } else if (!validateEmail(data.email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }

  // Phone validation
  if (!data.phone?.trim()) {
    errors.push('رقم الهاتف مطلوب');
  } else if (!validatePhone(data.phone)) {
    errors.push('رقم الهاتف غير صحيح');
  }

  // Subject validation
  if (!data.subject) {
    errors.push('المادة الدراسية مطلوبة');
  }

  return errors;
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^00968\d{8}$/.test(phone);
}

export function validatePassword(password) {
  return password.length >= 5;
}