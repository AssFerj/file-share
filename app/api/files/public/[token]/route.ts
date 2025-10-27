import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    
    if (!token) {
        return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    try {
        const file = await prisma.file.findUnique({ 
            where: { publicToken: String(token) },
            select: {
                id: true,
                filename: true,
                size: true,
                contentType: true,
                downloadCount: true,
                expiresAt: true,
                isPermanent: true,
                deletedAt: true,
                createdAt: true,
            }
        });
        
        if (!file || file.deletedAt) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json(file);
    } catch (err) {
        console.error('Error fetching file metadata:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
