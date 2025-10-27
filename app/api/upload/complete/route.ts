import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileId, size } = body;
        
        if (!fileId) {
            return NextResponse.json({ error: 'fileId required' }, { status: 400 });
        }

        const file = await prisma.file.findUnique({ where: { id: String(fileId) } });
        
        if (!file) {
            return NextResponse.json({ error: 'not found' }, { status: 404 });
        }

        // update size if provided
        await prisma.file.update({ 
            where: { id: file.id }, 
            data: { size: size ? Number(size) : file.size } 
        });

        // Generate public URL
        const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/f/${file.publicToken}`;

        return NextResponse.json({ 
            ok: true, 
            publicUrl,
            fileId: file.id 
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}