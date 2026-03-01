require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: orders, error } = await supabase.from('orders').select('total_amount, id').limit(100);
    if (error) {
        console.error(error); return;
    }
    const bad = orders.filter(o => isNaN(Number(o.total_amount)));
    if (bad.length > 0) {
        console.log('Bad orders:', bad);
    } else {
        console.log('All orders checked have valid numbers for total_amount.');
    }
}

check();
