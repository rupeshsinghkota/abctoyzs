const { google } = require('googleapis');

async function testCalendar() {
    console.log('Testing Google Calendar API Integration...');
    try {
        const credentialsStr = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
        const calendarId = process.env.GOOGLE_CALENDAR_ID;

        if (!credentialsStr || !calendarId) {
            console.error('❌ Missing credentials in .env.local');
            return;
        }

        const credentials = JSON.parse(credentialsStr);
        console.log('✅ Credentials parsed successfully');
        console.log(`📡 Target Calendar ID: ${calendarId}`);
        console.log(`🤖 Service Account: ${credentials.client_email}`);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
            clientOptions: { subject: calendarId } // Workspace Impersonation
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // Let's create a dummy 5-minute event happening in 1 hour
        const startDateTime = new Date();
        startDateTime.setHours(startDateTime.getHours() + 1);
        const endDateTime = new Date(startDateTime.getTime() + 5 * 60000);

        const event = {
            summary: `Automated Test Booking`,
            description: `Testing the Auto-Booking API connection.`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            conferenceData: {
                createRequest: {
                    requestId: `test-meet-${Date.now()}`,
                    // For secondary calendars, Google handles this better without the explicit 'hangoutsMeet' key
                },
            },
        };

        console.log('⏳ Attempting to insert test event...');
        const response = await calendar.events.insert({
            calendarId: calendarId,
            conferenceDataVersion: 1,
            requestBody: event,
        });

        console.log('🎉 SUCCESS! Event created.');
        console.log('🔗 Google Meet Link:', response.data.hangoutLink);
        console.log('📅 Event ID:', response.data.id);

        console.log('\n🧹 Cleaning up test event...');
        await calendar.events.delete({
            calendarId: calendarId,
            eventId: response.data.id,
        });
        console.log('✅ Test event deleted.');

    } catch (error) {
        console.error('\n❌ FAILED to create event.');
        console.error('Reason:', error.message);
        console.error('\n⚠️ Have you shared the calendar with the service account from your Google Calendar settings?');
        console.error('Make sure "Make changes to events" is checked!');
    }
}

testCalendar();
