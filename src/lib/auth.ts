import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "puerto-aventuras-servicesync-secret-key-2026"
);

export async function signJWT(payload: any): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${base64Header}.${base64Payload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    SECRET_KEY,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const base64Signature = Buffer.from(signature).toString('base64url');
  return `${data}.${base64Signature}`;
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [base64Header, base64Payload, base64Signature] = parts;
    const data = `${base64Header}.${base64Payload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      SECRET_KEY,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const signature = Buffer.from(base64Signature, 'base64url');
    const isValid = await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(data));
    if (!isValid) return null;
    
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    return payload;
  } catch (e) {
    return null;
  }
}

export async function getServerSession(options?: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('servicesync_token')?.value || 
                  cookieStore.get('next-auth.session-token')?.value ||
                  cookieStore.get('__Secure-next-auth.session-token')?.value;
    if (!token) return null;
    const payload = await verifyJWT(token);
    if (!payload) return null;
    return {
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        photoUrl: payload.photoUrl,
      }
    };
  } catch (e) {
    return null;
  }
}
