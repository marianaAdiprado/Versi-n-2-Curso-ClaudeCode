import crypto from 'crypto';
export const token=()=>crypto.createHash('sha256').update('adm'+process.env.ADMIN_PASSWORD).digest('hex');
