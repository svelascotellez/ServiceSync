import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  const cookiesToClear = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
  ];

  for (const cookieName of cookiesToClear) {
    response.cookies.set(cookieName, '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    // Also set non-secure fallback for local development
    response.cookies.set(cookieName, '', {
      path: '/',
      expires: new Date(0),
    });
  }

  return response;
}
