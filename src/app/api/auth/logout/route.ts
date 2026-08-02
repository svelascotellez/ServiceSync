import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  const cookiesToClear = [
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
    '__Secure-next-auth.callback-url',
    'next-auth.callback-url',
    '__Host-next-auth.csrf-token',
    'next-auth.csrf-token',
  ];

  for (const cookieName of cookiesToClear) {
    response.cookies.set(cookieName, '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  return response;
}
