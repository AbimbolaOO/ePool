import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export async function createHash(password: string) {
    const saltOrRounds = 6;
    return await bcrypt.hash(password, saltOrRounds);
}

export async function compareHash(password, hash) {
    return await bcrypt.compare(password, hash || '');
}

export function generateRandomByte(numBytes = 16) {
    const buffer = crypto.randomBytes(numBytes);
    const randomBytes = buffer.toString('hex');
    return randomBytes;
}

export const generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }

    return otp;
};
