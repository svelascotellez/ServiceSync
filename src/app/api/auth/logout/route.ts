import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  response.cookies.set('servicesync_token', '', { path: '/', expires: new Date(0) });
  response.cookies.set('next-auth.session-token', '', { path: '/', expires: new Date(0) });
  response.cookies.set('__Secure-next-auth.session-token', '', { path: '/', expires: new Date(0) });
  
  return response;
}
