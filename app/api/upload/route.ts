import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPresignedPutUrl } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { filename, size, contentType } = body;
        
        if (!filename || !size) {
            return NextResponse.json({ error: 'filename and size required' }, { status: 400 });
        }

        let plan;
        let ownerId = null;

        // If user is logged in, use their plan
        if (session?.user) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email! },
                include: { plan: true }
            });

            if (!user || !user.plan) {
                return NextResponse.json({ error: 'User plan not found' }, { status: 400 });
            }

            plan = user.plan;
            ownerId = user.id;
        } else {
            // If not logged in, use free plan
            const freePlanId = process.env.FREE_PLAN_ID;
            plan = await prisma.plan.findUnique({ where: { id: freePlanId } });
            
            if (!plan) {
                return NextResponse.json({ error: 'plan not configured' }, { status: 500 });
            }
        }

        // Validate file size against plan limit
        if (Number(size) > plan.maxFileSize) {
            return NextResponse.json({ 
                error: `File too large. Maximum size for ${plan.name} plan is ${Math.round(plan.maxFileSize / (1024 * 1024 * 1024))}GB` 
            }, { status: 400 });
        }

        const token = uuidv4();
        const key = `uploads/${new Date().toISOString().slice(0,10)}/${token}-${filename}`;
        const expiresAt = new Date(Date.now() + plan.retentionHrs * 60 * 60 * 1000);

        const file = await prisma.file.create({
            data: {
                filename,
                size: Number(size),
                contentType: contentType || undefined,
                r2Key: key,
                publicToken: token,
                ownerId: ownerId,
                expiresAt,
                isPermanent: plan.retentionHrs >= 720, // 30 days or more = permanent
            }
        });

        const uploadUrl = await getPresignedPutUrl(process.env.R2_BUCKET!, key, 60 * 15);

        return NextResponse.json({ 
            uploadUrl, 
            fileId: file.id, 
            publicToken: token,
            expiresAt: file.expiresAt,
            planName: plan.name
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}