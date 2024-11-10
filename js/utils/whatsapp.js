// Simulated WhatsApp verification service
// In a real application, this would integrate with WhatsApp Business API

export async function sendWhatsAppVerification(phone) {
    try {
        // Remove any formatting from phone number
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Generate a 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // In a real app, this would send the code via WhatsApp API
        // For demo purposes, we'll store it in localStorage
        const verifications = JSON.parse(localStorage.getItem('whatsapp_verifications') || '{}');
        verifications[cleanPhone] = {
            code,
            timestamp: Date.now(),
            attempts: 0
        };
        localStorage.setItem('whatsapp_verifications', JSON.stringify(verifications));
        
        // Log the code for testing (remove in production)
        console.log(`WhatsApp verification code for ${cleanPhone}: ${code}`);
        
        return code;
    } catch (error) {
        console.error('Error sending WhatsApp verification:', error);
        throw new Error('فشل إرسال رمز التحقق');
    }
}

export async function verifyWhatsAppCode(phone, code) {
    try {
        const cleanPhone = phone.replace(/\D/g, '');
        const verifications = JSON.parse(localStorage.getItem('whatsapp_verifications') || '{}');
        const verification = verifications[cleanPhone];
        
        if (!verification) {
            throw new Error('No verification found');
        }
        
        // Check if code has expired (15 minutes)
        if (Date.now() - verification.timestamp > 15 * 60 * 1000) {
            delete verifications[cleanPhone];
            localStorage.setItem('whatsapp_verifications', JSON.stringify(verifications));
            throw new Error('Verification code expired');
        }
        
        // Check if too many attempts
        if (verification.attempts >= 3) {
            delete verifications[cleanPhone];
            localStorage.setItem('whatsapp_verifications', JSON.stringify(verifications));
            throw new Error('Too many attempts');
        }
        
        // Verify code
        if (verification.code === code) {
            delete verifications[cleanPhone];
            localStorage.setItem('whatsapp_verifications', JSON.stringify(verifications));
            return true;
        }
        
        // Increment attempts
        verification.attempts++;
        verifications[cleanPhone] = verification;
        localStorage.setItem('whatsapp_verifications', JSON.stringify(verifications));
        
        return false;
    } catch (error) {
        console.error('Error verifying WhatsApp code:', error);
        throw new Error('فشل التحقق من الرمز');
    }
}