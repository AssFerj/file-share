import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // TODO: Add admin authentication
        
        // Get total files count
        const totalFiles = await prisma.file.count({
            where: { deletedAt: null },
        });

        // Get total deleted files
        const deletedFiles = await prisma.file.count({
            where: { deletedAt: { not: null } },
        });

        // Get total storage used (in bytes)
        const storageResult = await prisma.file.aggregate({
            where: { deletedAt: null },
            _sum: {
                size: true,
            },
        });

        // Get total downloads
        const downloadsResult = await prisma.file.aggregate({
            _sum: {
                downloadCount: true,
            },
        });

        // Get expired files count
        const expiredFiles = await prisma.file.count({
            where: {
                expiresAt: { lt: new Date() },
                isPermanent: false,
                deletedAt: null,
            },
        });

        // Get total users
        const totalUsers = await prisma.user.count();

        // Get files by plan
        const filesByPlan = await prisma.file.groupBy({
            by: ['ownerId'],
            where: { deletedAt: null },
            _count: true,
        });

        return NextResponse.json({
            totalFiles,
            deletedFiles,
            expiredFiles,
            totalStorageBytes: storageResult._sum.size || 0,
            totalDownloads: downloadsResult._sum.downloadCount || 0,
            totalUsers,
            filesByPlan: filesByPlan.length,
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}
