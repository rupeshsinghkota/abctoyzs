import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Package, MapPin, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/profile');
    }

    // Fetch recent orders (limit 1 for preview)
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

    // Fetch default address
    const { data: defaultAddress } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="bg-primary/5 py-12 mb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold font-heading">My Account</h1>
                    <p className="text-muted-foreground mt-2">Manage your orders, addresses, and details.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
                <ProfileSidebar />

                <div className="flex-1 space-y-6">
                    {/* Welcome Card */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Welcome back!</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Recent Orders Preview */}
                        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Recent Orders
                                </h3>
                                <Link href="/orders" className="text-sm text-primary font-bold hover:underline">
                                    View All
                                </Link>
                            </div>

                            <div className="flex-1">
                                {recentOrders && recentOrders.length > 0 ? (
                                    <div className="bg-muted/30 rounded-xl p-4 border">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold">Order #{recentOrders[0].id.slice(0, 8)}</span>
                                            <span className="text-xs px-2 py-1 bg-white rounded-full border shadow-sm capitalize">
                                                {recentOrders[0].status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(recentOrders[0].created_at).toLocaleDateString()}
                                        </p>
                                        <p className="font-bold mt-1">₹{recentOrders[0].total_amount.toLocaleString()}</p>
                                        <Link
                                            href={`/orders/${recentOrders[0].id}`}
                                            className="block mt-3 text-center w-full py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            Track Order
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
                                        <p>No recent orders.</p>
                                        <Link href="/" className="text-primary text-sm font-bold mt-2 hover:underline">
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address Preview */}
                        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Default Address
                                </h3>
                                <Link href="/profile/addresses" className="text-sm text-primary font-bold hover:underline">
                                    Manage
                                </Link>
                            </div>

                            <div className="flex-1">
                                {defaultAddress ? (
                                    <div className="text-sm leading-relaxed p-4 bg-muted/30 border rounded-xl h-full">
                                        <p className="font-bold text-foreground">{defaultAddress.name}</p>
                                        <p>{defaultAddress.address_line1}</p>
                                        {defaultAddress.address_line2 && <p>{defaultAddress.address_line2}</p>}
                                        <p>{defaultAddress.city}, {defaultAddress.state}</p>
                                        <p>{defaultAddress.pincode}</p>
                                        <p className="mt-2 text-muted-foreground">{defaultAddress.phone}</p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
                                        <p>No default address set.</p>
                                        <Link href="/profile/addresses/new" className="text-primary text-sm font-bold mt-2 hover:underline">
                                            Add Address
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
