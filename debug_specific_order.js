
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cdybntjtotrmifxdzcyn.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkeWJudGp0b3RybWlmeGR6Y3luIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM5ODQ1OSwiZXhwIjoyMDg0OTc0NDU5fQ.X-dtBRSLKN1gpkLJnJGFSFCQowzD6ZiPJUQ21hV2BTA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const prefix = '3b90bf40';
    console.log(`Searching for order starting with ${prefix}...`);

    // Using raw query via .rpc or just listing all and filtering if ilike fails on uuid
    // Or better: fetch all orders and filter in JS for now as it's small
    const { data: allOrders, error } = await supabase
        .from('orders')
        .select('*');

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    const orders = allOrders.filter(o => o.id.toLowerCase().startsWith(prefix));

    console.log(`Found ${orders?.length || 0} orders.`);

    if (orders && orders.length > 0) {
        const order = orders[0];
        console.log('--- ORDER FOUND ---');
        console.log(JSON.stringify(order, null, 2));

        if (order.shipping_address_id) {
            const { data: addr } = await supabase.from('addresses').select('*').eq('id', order.shipping_address_id).single();
            console.log('--- ADDRESS ---');
            if (addr) {
                console.log(JSON.stringify(addr, null, 2));
            } else {
                console.log(`Address with ID ${order.shipping_address_id} NOT FOUND in addresses table.`);
            }
        } else {
            console.log('Order has NO shipping_address_id.');
        }

        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        console.log('--- ITEMS ---');
        console.log(JSON.stringify(items, null, 2));
    } else {
        console.log('No order found with that prefix.');
    }
}

main();
