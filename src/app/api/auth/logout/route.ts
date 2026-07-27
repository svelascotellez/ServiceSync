import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const isProd = process.env.NODE_ENV === 'production';
  const cookieName = isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
  
  response.cookies.set(cookieName, '', {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });

  return response;
}
