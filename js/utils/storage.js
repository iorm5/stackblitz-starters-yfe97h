const PREFIX = 'app_';

export function setItem(key, value) {
  try {
    const prefixedKey = PREFIX + key;
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(prefixedKey, serializedValue);
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
}

export function getItem(key) {
  try {
    const prefixedKey = PREFIX + key;
    const serializedValue = localStorage.getItem(prefixedKey);
    return serializedValue ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
}

export function removeItem(key) {
  try {
    const prefixedKey = PREFIX + key;
    localStorage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
}

export function clear() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}