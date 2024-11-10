import { showError, showSuccess } from '../utils/notifications.js';
import { uploadFile } from '../utils/upload.js';
import { getSubjectName } from './teachers.js';

export function loadUserProfile(user) {
  if (!user) return;

  const nameElement = document.getElementById('userName');
  const subjectElement = document.getElementById('userSubject');
  const profileImage = document.getElementById('profileImage');

  if (nameElement) {
    nameElement.textContent = user.name;
  }
  if (subjectElement) {
    subjectElement.textContent = getSubjectName(user.subject);
  }
  if (profileImage && user.profileImage) {
    profileImage.src = user.profileImage;
  }

  // Fill profile form
  const form = document.getElementById('profileForm');
  if (form) {
    const fields = ['name', 'email', 'phone', 'subject'];
    fields.forEach(field => {
      const input = form.querySelector(`#${field}`);
      if (input && user[field]) {
        input.value = user[field];
      }
    });
  }
}

export async function updateProfile(currentUser, profileData) {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = { ...users[userIndex], ...profileData };
    users[userIndex] = updatedUser;
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('حدث خطأ أثناء تحديث الملف الشخصي');
  }
}

export async function handleProfileImageUpload(currentUser, onSuccess) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadFile(file, 'profiles');
      const updatedUser = await updateProfile(currentUser, { profileImage: imageUrl });
      
      const profileImage = document.getElementById('profileImage');
      if (profileImage) {
        profileImage.src = imageUrl;
      }

      showSuccess('تم تحديث الصورة الشخصية بنجاح');
      if (onSuccess) {
        onSuccess(updatedUser);
      }
    } catch (error) {
      showError('حدث خطأ أثناء تحديث الصورة الشخصية');
    }
  };

  input.click();
}