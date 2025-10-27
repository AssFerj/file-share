import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteObject } from '@/lib/r2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
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

        const file = await prisma.file.findUnique({
            where: { id: String(id) }
        });

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Check ownership (admins can delete any file)
        if (file.ownerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Soft delete in database
        await prisma.file.update({
            where: { id: file.id },
            data: { deletedAt: new Date() }
        });

        // Delete from R2
        try {
            await deleteObject(process.env.R2_BUCKET!, file.r2Key);
        } catch (r2Error) {
            console.error('Error deleting from R2:', r2Error);
            // Continue even if R2 deletion fails
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
