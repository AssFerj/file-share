/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        // Check if user is admin
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                planId: true,
                plan: {
                    select: {
                        id: true,
                        name: true,
                        maxFileSize: true,
                        retentionHrs: true,
                        priceCents: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        files: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}
