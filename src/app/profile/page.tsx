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

    // Fetch recent order with items for thumbnail
    const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

    const { data: defaultAddress } = await supabase
        .from('profiles')
        .select('default_address_id')
        .eq('id', user.id)
        .single();

    let primaryAddress = null;
    if (defaultAddress?.default_address_id) {
        const { data: addr } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', defaultAddress.default_address_id)
            .single();
        primaryAddress = addr;
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-32">
            {/* Desktop Header */}
            <div className="hidden md:block bg-zinc-950 pt-20 pb-32 -mb-16 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tight">Account Garage</h1>
                    <p className="text-zinc-500 font-bold mt-2">Manage your collection and delivery zones</p>
                </div>
            </div>

            {/* Mobile Header: Premium Soft Charcoal Gradient */}
            <div className="md:hidden bg-[#0A0A0A] pt-10 pb-16 px-6 relative overflow-hidden">
                {/* Decorative Light Leak */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <div className="relative z-10 flex items-center gap-5 pt-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white border border-white/5 shadow-2xl">
                            <UserIcon className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-4 border-[#0A0A0A] flex items-center justify-center">
                            <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-0.5">Premium Member</p>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                            {user.email?.split('@')[0] || 'Explorer'}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8 relative z-20 -mt-10 md:mt-0">
                <ProfileSidebar />

                <div className="flex-1 space-y-6">
                    {/* Action Dashboards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Dynamic Order Card */}
                        {recentOrders && recentOrders.length > 0 ? (
                            <Link href={`/orders/${recentOrders[0].id}`} className="bg-white border border-zinc-100/80 rounded-[2.5rem] p-6 shadow-xl shadow-zinc-200/40 group active:scale-[0.97] transition-all flex flex-col justify-between min-h-[180px]">
                                <div className="flex items-start justify-between">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden relative">
                                        {recentOrders[0].items?.[0]?.product_image ? (
                                            <img src={recentOrders[0].items[0].product_image} alt="Order" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                                <Package className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                        )}
                                        {/* Status Dot */}
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                    </div>
                                    <div className="px-3 py-1 bg-zinc-50 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-widest border border-zinc-100">Live Tracker</div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 tracking-tight mt-4">Order #{recentOrders[0].id.slice(0, 8)}</h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-zinc-400 font-bold text-[11px] uppercase tracking-tight">Expected Delivery: Soon</span>
                                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="bg-white border border-zinc-200/50 border-dashed rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 mb-3">
                                    <Package className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-sm font-black text-zinc-900 tracking-tight">Empty Garage</h3>
                                <Link href="/" className="text-[11px] font-black text-primary uppercase tracking-widest mt-2 hover:underline">Start Shopping</Link>
                            </div>
                        )}

                        {/* Primary Address Card */}
                        <Link href="/profile/addresses" className="bg-white border border-zinc-100/80 rounded-[2.5rem] p-6 shadow-xl shadow-zinc-200/40 group active:scale-[0.97] transition-all flex flex-col justify-between min-h-[180px]">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg border border-white/10">
                                    <MapPin className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <div className="px-3 py-1 bg-zinc-50 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-widest border border-zinc-100">Ship To</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 tracking-tight mt-4">
                                    {primaryAddress ? primaryAddress.city : "No Location Set"}
                                </h3>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-zinc-400 font-bold text-[11px] uppercase tracking-tight truncate max-w-[150px]">
                                        {primaryAddress ? primaryAddress.state : "Add your default address"}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
