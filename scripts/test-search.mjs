
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cdybntjtotrmifxdzcyn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkeWJudGp0b3RybWlmeGR6Y3luIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM5ODQ1OSwiZXhwIjoyMDg0OTc0NDU5fQ.X-dtBRSLKN1gpkLJnJGFSFCQowzD6ZiPJUQ21hV2BTA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSearch(searchTerm) {
    console.log(`Testing search for: "${searchTerm}"`)
    let query = supabase.from('products').select('name, stock')

    const words = searchTerm.split(' ').filter(w => w.length > 2)
    console.log(`Words:`, words)

    words.forEach(word => {
        query = query.ilike('name', `%${word}%`)
    })

    const { data, error } = await query.limit(5)

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Found:', data.length, 'matches')
    data.forEach(p => console.log(`- ${p.name} (Stock: ${p.stock})`))
}

async function runTests() {
    await testSearch('ABC Toyz Rubbion 12V Jeep')
    await testSearch('Rubbion Jeep')
}

runTests()
