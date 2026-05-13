import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { password } = await request.json();

    if (!process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
}
