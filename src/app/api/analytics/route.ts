import { NextResponse } from 'next/server';
import { logAnalytics, getAnalytics } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { type, value } = await req.json();
    if (!type || !value) {
      return NextResponse.json({ success: false, error: 'Type and value are required.' }, { status: 400 });
    }

    // 1. Generate an IP hash for visitor counting privacy
    let ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    // Clean potential proxy lists
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    const ipHash = crypto
      .createHash('sha256')
      .update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || 'niranjanos_salt'))
      .digest('hex')
      .substring(0, 16);

    // 2. Log event in database
    await logAnalytics(type, value, ipHash);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to log analytics:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = await getAnalytics();
    return NextResponse.json(events);
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
