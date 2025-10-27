import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteObject } from '@/lib/r2';

export async function GET(req: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        }

        const now = new Date();
        
        // Find expired files that are not permanent and not already deleted
        const expiredFiles = await prisma.file.findMany({
            where: {
                expiresAt: {
                    lt: now,
                },
                isPermanent: false,
                deletedAt: null,
            },
        });

        console.log(`Found ${expiredFiles.length} expired files to delete`);

        let deletedCount = 0;
        let errorCount = 0;

        // Delete each expired file
        for (const file of expiredFiles) {
            try {
                // Delete from R2
                await deleteObject(process.env.R2_BUCKET!, file.r2Key);
                
                // Mark as deleted in database
                await prisma.file.update({
                    where: { id: file.id },
                    data: {
                        deletedAt: now,
                        deletedBy: 'system-cron',
                    },
                });
                
                deletedCount++;
                console.log(`✅ Deleted expired file: ${file.filename} (${file.id})`);
            } catch (err) {
                errorCount++;
                console.error(`❌ Error deleting file ${file.id}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            totalFound: expiredFiles.length,
            deleted: deletedCount,
            errors: errorCount,
            timestamp: now.toISOString(),
        });
    } catch (err) {
        console.error('Cron cleanup error:', err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}
