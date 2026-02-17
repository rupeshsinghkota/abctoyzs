import { NextResponse } from 'next/server';
import { ContactService } from '@/lib/services/contact';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await ContactService.submitInquiry({
            name,
            email,
            subject,
            message
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Contact API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit inquiry' },
            { status: 500 }
        );
    }
}
