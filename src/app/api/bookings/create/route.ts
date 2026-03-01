import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import crypto from 'crypto';
import { WhatsAppService } from '@/lib/services/whatsapp';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

        console.log('[BookingCreate] Finalizing Booking:', { customerName, razorpayOrderId, date, time });

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
                console.error('[BookingCreate] Invalid Signature');
                return NextResponse.json({ message: 'Invalid payment signature' }, { status: 400 });
            }
        } else if (process.env.RAZORPAY_KEY_SECRET) {
            console.error('[BookingCreate] Missing Payment Details for verification');
            return NextResponse.json({ message: 'Missing payment details' }, { status: 400 });
        } else {
            console.warn("Skipping Razorpay signature verification due to missing SECRET in env.");
        }

        // 3. Environment Check for Google API
        const credentialsStr = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
        const calendarId = process.env.GOOGLE_CALENDAR_ID;

        if (!credentialsStr || !calendarId) {
            console.error('Missing Google Calendar API credentials in environment.');
            // We should still update the order status as paid before returning error
            if (razorpayOrderId) {
                await supabaseAdmin
                    .from('orders')
                    .update({
                        payment_status: 'paid', // Use 'paid' instead of custom 'paid_advance' for standard compatibility
                        razorpay_payment_id: razorpayPaymentId,
                        status: 'processing'
                    })
                    .eq('razorpay_order_id', razorpayOrderId);
            }

            return NextResponse.json({
                message: 'Booking partially successful. Calendar setup required by admin.',
                simulated: true,
                meetLink: "Showroom Consultant will contact you with link."
            }, { status: 200 }); // Return success status so frontend shows done, but with warning
        }

        // 4. Parse Google Credentials
        let credentials;
        try {
            credentials = JSON.parse(credentialsStr);
        } catch (error) {
            console.error('Failed to parse Google Service Account JSON');
            return NextResponse.json({ message: 'Invalid Google Credentials format.' }, { status: 500 });
        }

        // 5. Authenticate with Google API using Service Account (With Workspace Impersonation if possible)
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
            clientOptions: { subject: calendarId }
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // 6. Format Date & Time for Google Calendar API
        // IST Conversion (+05:30)
        let hour24 = 0;
        let min = '00';
        try {
            const [hourStr, minPart] = time.split(':');
            const [minStr, modifier] = minPart.split(' ');
            hour24 = parseInt(hourStr, 10);
            min = minStr;
            if (hour24 === 12) {
                hour24 = modifier === 'PM' ? 12 : 0;
            } else if (modifier === 'PM') {
                hour24 += 12;
            }
        } catch (e) {
            console.error('Time parsing error:', e, time);
            hour24 = 12; // Fallback
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
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            conferenceDataVersion: 1,
            requestBody: event,
        }).catch(err => {
            console.error('Google Calendar Error:', err.message);
            return null;
        });

        // 8. Handle Google Meet Link
        let meetLink = response?.data?.hangoutLink;

        if (!meetLink) {
            console.warn("⚠️ Google API created the event but didn't generate a Meet link.");
            meetLink = "Admin will share meeting link via WhatsApp 5 mins before.";
        }

        // 9. Update Order Record using Admin (for guests)
        if (razorpayOrderId) {
            await supabaseAdmin
                .from('orders')
                .update({
                    payment_status: 'paid', // Standard 'paid' status
                    razorpay_payment_id: razorpayPaymentId,
                    status: 'processing',
                    admin_notes: `JSON_BOOKING:{"date":"${date}","time":"${time}","meet":"${meetLink}"}`
                })
                .eq('razorpay_order_id', razorpayOrderId);
        }

        // 10. Send WhatsApp Notifications
        try {
            const adminPhone = process.env.ADMIN_PHONE_NUMBER || '919155149597';
            const formattedDate = new Date(date).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
            });
            const customerPhoneWithCode = customerPhone.length === 10 ? `91${customerPhone}` : customerPhone;
            const isMeetLinkReal = meetLink && !meetLink.startsWith('Admin will');
            const meetLinkText = isMeetLinkReal
                ? `🎥 Join here: ${meetLink}`
                : `🎥 Our team will share the Google Meet link on WhatsApp 5 mins before your slot.`;

            const bookingTemplateId = process.env.MSG91_BOOKING_CONFIRMED_TEMPLATE_ID || 'booking';

            const customerNotification = bookingTemplateId
                ? WhatsAppService.sendTemplateMessage(customerPhoneWithCode, bookingTemplateId, {
                    '1': customerName,
                    '2': productName,
                    '3': formattedDate,
                    '4': time,
                    '5': meetLinkText,
                })
                : WhatsAppService.sendMessage(customerPhoneWithCode,
                    `✅ *Booking Confirmed — ABC Toyz*\n\n` +
                    `Hi ${customerName}! Your live video call is confirmed.\n\n` +
                    `📦 *Product:* ${productName}\n` +
                    `📅 *Date:* ${formattedDate}\n` +
                    `⏰ *Time:* ${time}\n` +
                    `💳 *Amount Paid:* ₹99\n\n` +
                    `${meetLinkText}\n\n` +
                    `Reply here for any questions. See you soon! 🚀`
                );

            const adminMessage =
                `🔔 *New Video Call Booking!*\n\n` +
                `*Customer:* ${customerName}\n` +
                `*Phone:* ${customerPhone}\n` +
                `*Email:* ${customerEmail}\n` +
                `*Product:* ${productName}\n` +
                `*Date:* ${formattedDate}\n` +
                `*Time:* ${time}\n` +
                `*Payment:* ₹99 paid ✅\n` +
                `*Razorpay ID:* ${razorpayPaymentId || 'N/A'}\n\n` +
                (isMeetLinkReal
                    ? `*Meet Link:* ${meetLink}`
                    : `⚠️ Meet link not auto-generated. Share one manually 5 mins before the slot.`);

            await Promise.allSettled([
                customerNotification,
                WhatsAppService.sendMessage(adminPhone, adminMessage),
            ]);
        } catch (waErr) {
            console.error('[BookingCreate] Notification failed:', waErr);
        }

        return NextResponse.json({
            success: true,
            message: 'Slot booked successfully',
            meetLink: meetLink,
            eventId: response?.data?.id
        });

    } catch (error: any) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ message: 'Failed to create booking', error: error.message }, { status: 500 });
    }
}
