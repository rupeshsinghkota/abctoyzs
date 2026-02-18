
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cdybntjtotrmifxdzcyn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkeWJudGp0b3RybWlmeGR6Y3luIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM5ODQ1OSwiZXhwIjoyMDg0OTc0NDU5fQ.X-dtBRSLKN1gpkLJnJGFSFCQowzD6ZiPJUQ21hV2BTA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStock() {
    const { data, error } = await supabase
        .from('products')
        .select('name, stock, base_price')
        .ilike('name', '%Rubbion%')

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Product Data:', JSON.stringify(data, null, 2))
}

checkStock()
