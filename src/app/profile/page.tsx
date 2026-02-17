import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Package, MapPin, User as UserIcon, ShieldCheck, ChevronRight } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-24">
            {/* App-Style Minimal Header (Hidden on Mobile) */}
            <div className="hidden md:block bg-zinc-900 pt-16 pb-24 -mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">My Profile</h1>
                    <p className="text-zinc-400 font-bold mt-2 text-sm md:text-base">Manage your orders and account settings</p>
                </div>
            </div>

            {/* Mobile Header: Profile Summary Card */}
            <div className="md:hidden bg-zinc-900 pt-6 pb-10 px-6 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/50 to-transparent" />
                <div className="relative z-10 flex items-center gap-4 pt-4">
                    <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 border-2 border-white/20">
                        <UserIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Hello, {user.email?.split('@')[0] || 'Customer'}</h2>
                        <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            Verified Account
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8 relative z-20 -mt-8 md:mt-0">
                <ProfileSidebar />

                <div className="flex-1 space-y-6">
                    {/* Recent Content Preview (Desktop & Tablet) */}
                    <div className="grid md:grid-cols-2 gap-6 pb-12">
                        {/* Order Status QuickView */}
                        {recentOrders && recentOrders.length > 0 ? (
                            <Link href={`/orders/${recentOrders[0].id}`} className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 group active:scale-[0.98] transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-tighter border border-zinc-100">Latest Order</div>
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2">Order #{recentOrders[0].id.slice(0, 8)}</h3>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 font-bold uppercase tracking-tight text-xs">{new Date(recentOrders[0].created_at).toLocaleDateString()}</span>
                                    <span className="text-primary font-black">₹{recentOrders[0].total_amount.toLocaleString()}</span>
                                </div>
                                <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                                    <span className="text-sm font-black text-zinc-900">Track current status</span>
                                    <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ) : (
                            <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-200 mb-4">
                                    <Package className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-black text-zinc-900 tracking-tight">No orders yet</h3>
                                <p className="text-zinc-400 font-bold text-xs mt-1">Start shopping to fill your garage!</p>
                                <Link href="/" className="mt-6 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-xs tracking-tight shadow-xl">Browse Collection</Link>
                            </div>
                        )}

                        {/* Saved Locations */}
                        <Link href="/profile/addresses" className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 group active:scale-[0.98] transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200 mb-6">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Stored Addresses</h3>
                                <p className="text-zinc-400 font-bold text-sm mt-1">Manage delivery locations</p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                                <span className="text-sm font-black text-zinc-900">Manage saved profiles</span>
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
