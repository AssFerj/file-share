import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // TODO: Add admin authentication
        const plans = await prisma.plan.findMany({
            orderBy: {
                priceCents: 'asc',
            },
        });

        return NextResponse.json(plans);
    } catch (err) {
        console.error('Error fetching plans:', err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // TODO: Add admin authentication
        const body = await req.json();
        const { name, maxFileSize, retentionHrs, priceCents } = body;

        if (!name || !maxFileSize || !retentionHrs) {
            return NextResponse.json(
                { error: 'name, maxFileSize, and retentionHrs are required' },
                { status: 400 }
            );
        }

        const plan = await prisma.plan.create({
            data: {
                name,
                maxFileSize: Number(maxFileSize),
                retentionHrs: Number(retentionHrs),
                priceCents: priceCents ? Number(priceCents) : null,
            },
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (err) {
        console.error('Error creating plan:', err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}
