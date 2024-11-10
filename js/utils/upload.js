export async function uploadFile(file, folder) {
    // Validate file
    if (!file || !isValidImageFile(file)) {
        throw new Error('الملف غير صالح');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            try {
                // Store the data URL in localStorage (for demo purposes)
                const files = JSON.parse(localStorage.getItem('uploadedFiles') || '{}');
                const fileId = Date.now();
                const filePath = `${folder}/${fileId}-${file.name}`;
                
                files[filePath] = reader.result;
                localStorage.setItem('uploadedFiles', JSON.stringify(files));
                
                resolve(reader.result);
            } catch (error) {
                reject(new Error('فشل تحميل الملف'));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('فشل قراءة الملف'));
        };
        
        reader.readAsDataURL(file);
    });
}

function isValidImageFile(file) {
    // Check file type
    if (!file.type.startsWith('image/')) {
        return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        return false;
    }

    return true;
}