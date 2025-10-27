import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPresignedGetUrl } from '@/lib/r2';

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
            where: { publicToken: String(token) }
        });
        
        if (!file || file.deletedAt) {
            return NextResponse.json({ error: 'File not found or deleted' }, { status: 404 });
        }

        // Check if file is expired
        if (!file.isPermanent && file.expiresAt && new Date(file.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'File has expired' }, { status: 410 });
        }

        // Increment download count
        await prisma.file.update({
            where: { id: file.id },
            data: { downloadCount: { increment: 1 } }
        });

        // Generate presigned URL for download
        const downloadUrl = await getPresignedGetUrl(
            process.env.R2_BUCKET!,
            file.r2Key,
            300 // 5 minutes
        );

        // Redirect to the presigned URL
        return NextResponse.redirect(downloadUrl);
    } catch (err) {
        console.error('Error downloading file:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
