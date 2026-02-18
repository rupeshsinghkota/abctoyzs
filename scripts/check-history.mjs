
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cdybntjtotrmifxdzcyn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkeWJudGp0b3RybWlmeGR6Y3luIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM5ODQ1OSwiZXhwIjoyMDg0OTc0NDU5fQ.X-dtBRSLKN1gpkLJnJGFSFCQowzD6ZiPJUQ21hV2BTA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkHistory() {
    const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .ilike('message', '%Rubbion%')
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Conversation Data:', JSON.stringify(data, null, 2))
}

checkHistory()
