import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import sharp from 'sharp';

export async function createHash(password: string): Promise<string> {
  const saltOrRounds = 6;
  return await bcrypt.hash(password, saltOrRounds);
}

export async function compareHash(
  password: string,
  hash: string,
): Promise<boolean> {
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

export const generateLinkCode = (length = 4) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

export async function calculateAspectRatio(file: Express.Multer.File): Promise<{
  aspectRatio: number;
  aspectRatioW: number;
  aspectRatioH: number;
}> {
  const defaultResult = {
    aspectRatio: 1.0,
    aspectRatioW: 1.0,
    aspectRatioH: 1.0,
  };

  if (!file.mimetype.startsWith('image/')) {
    return defaultResult;
  }

  try {
    const metadata = await sharp(file.buffer).metadata();

    const width = metadata.width;
    const height = metadata.height;

    if (!width || !height) {
      console.warn('Could not determine image dimensions');
      return defaultResult;
    }

    const aspectRatio = width / height;
    const aspectRatioW = width;
    const aspectRatioH = height;

    return {
      aspectRatio,
      aspectRatioW,
      aspectRatioH,
    };
  } catch (error) {
    console.error('Error calculating aspect ratio:', error);
    return defaultResult;
  }
}
