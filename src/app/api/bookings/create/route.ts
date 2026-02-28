import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import crypto from 'crypto';

// ==========================================
// ⚠️ ADMIN SETUP REQUIRED
// ==========================================
// 1. Create a Service Account in Google Cloud Console
// 2. Enable Google Calendar API for your GCP project
// 3. Share your calendar with the Service Account email
// 4. Add the JSON key content to GOOGLE_SERVICE_ACCOUNT_CREDENTIALS in .env
// 5. Add your Calendar ID to GOOGLE_CALENDAR_ID in .env
// ==========================================

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            productId, productName, date, time, customerName, customerEmail, customerPhone,
            razorpayPaymentId, razorpayOrderId, razorpaySignature
        } = body;

        // 1. Validations
        if (!date || !time || !customerEmail) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // 2. Verify Razorpay payment signature
        if (process.env.RAZORPAY_KEY_SECRET && razorpayPaymentId && razorpayOrderId && razorpaySignature) {
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
            const generatedSignature = hmac.digest('hex');

            if (generatedSignature !== razorpaySignature) {
                return NextResponse.json({ message: 'Invalid payment signature' }, { status: 400 });
            }
        } else if (process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ message: 'Missing payment details' }, { status: 400 });
        } else {
            console.warn("Skipping Razorpay signature verification due to missing SECRET in env.");
        }

        // 3. Environment Check for Google API
        const credentialsStr = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
        const calendarId = process.env.GOOGLE_CALENDAR_ID;

        if (!credentialsStr || !calendarId) {
            console.error('Missing Google Calendar API credentials in environment.');
            return NextResponse.json({
                message: 'Google API Setup Required. Admin needs to add credentials to .env',
                simulated: true // tells frontend to still show success state for testing
            }, { status: 500 });
        }

        // 4. Parse Google Credentials
        let credentials;
        try {
            credentials = JSON.parse(credentialsStr);
        } catch (error) {
            console.error('Failed to parse Google Service Account JSON');
            return NextResponse.json({ message: 'Invalid Google Credentials format.' }, { status: 500 });
        }

        // 5. Authenticate with Google API using Service Account (With Workspace Impersonation)
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
            clientOptions: { subject: calendarId }
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // 6. Format Date & Time for Google Calendar API
        // Parse 'YYYY-MM-DD' and '04:30 PM' into ISO string
        // Note: Simple conversion assuming IST for now. Better to use date-fns/moment in prod.
        const [hour, minPart] = time.split(':');
        const [min, modifier] = minPart.split(' ');

        let hour24 = parseInt(hour, 10);
        if (hour24 === 12) {
            hour24 = modifier === 'PM' ? 12 : 0;
        } else if (modifier === 'PM') {
            hour24 += 12;
        }

        const startDateTime = new Date(`${date}T${hour24.toString().padStart(2, '0')}:${min}:00+05:30`);
        const endDateTime = new Date(startDateTime.getTime() + 15 * 60000); // 15 mins later

        // 7. Create the Event with Google Meet link
        const event = {
            summary: `Live Demo: ${productName} (${customerName})`,
            description: `Live video tour for ${productName}.\n\nCustomer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            attendees: [
                { email: customerEmail }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
            conferenceData: {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    // Let Google auto-assign the default video conferencing type (works better for secondary calendars)
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            conferenceDataVersion: 1, // Required to try and generate Google Meet link
            requestBody: event,
        });

        // 8. Handle Google Meet Link (Workaround for Service Accounts on Free/Secondary Calendars)
        // Service accounts often fail to silently generate Meet links on non-primary or non-Workspace calendars.
        // If it fails, we provide a fallback link or instructions.
        let meetLink = response.data.hangoutLink;

        if (!meetLink) {
            console.warn("⚠️ Google API created the event but didn't generate a Meet link. This is a known limitation of Service Accounts on secondary/free calendars.");
            // Fallback: We can either generate a dummy link, or since we have the customer's phone/email, 
            // the admin can just send them a link at the time of the meeting.
            meetLink = "Admin will share meeting link via WhatsApp 5 mins before.";
        }

        // 9. Update the Supabase Order to reflect the Booking Advance Payment
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();

        // Use the razorpayOrderId that was just paid to find and update the pending order
        if (razorpayOrderId) {
            await supabase
                .from('orders')
                .update({
                    payment_status: 'paid_advance',
                    razorpay_payment_id: razorpayPaymentId,
                    status: 'processing' // Ensure it's marked as processing now
                })
                .eq('razorpay_order_id', razorpayOrderId);
        }

        // 10. Return the generated Meet Link to the frontend
        return NextResponse.json({
            success: true,
            message: 'Slot booked successfully',
            meetLink: meetLink,
            eventId: response.data?.id
        });

    } catch (error: any) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ message: 'Failed to create booking', error: error.message }, { status: 500 });
    }
}
