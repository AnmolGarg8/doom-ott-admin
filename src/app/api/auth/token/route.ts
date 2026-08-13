import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return NextResponse.json({ token: token || null });
}
