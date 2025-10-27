import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('🔍 Fetching files for user:', user.id, user.email);

        const files = await prisma.file.findMany({
            where: { 
                ownerId: user.id,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                filename: true,
                size: true,
                contentType: true,
                publicToken: true,
                downloadCount: true,
                expiresAt: true,
                isPermanent: true,
                createdAt: true,
                deletedAt: true,
            }
        });

        // Filter out deleted files in JavaScript
        const activeFiles = files.filter(f => !f.deletedAt);

        console.log('📁 Found files:', activeFiles.length);
        activeFiles.forEach(f => console.log(`  - ${f.filename}`));

        // Add publicUrl to each file and remove deletedAt from response
        const filesWithUrl = activeFiles.map(({ deletedAt, ...file }) => ({
            ...file,
            publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/f/${file.publicToken}`,
        }));

        return NextResponse.json(filesWithUrl);
    } catch (err) {
        console.error('Error fetching files:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
