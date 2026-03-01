require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
        console.error('Error fetching orders:', error);
    } else {
        console.log('Columns in orders:', Object.keys(data[0] || {}));
    }
}

check();
