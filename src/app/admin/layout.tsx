import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Home,
    Globe,
    Mail,
    Ticket,
    Video,
    MessageSquare,
    Settings
} from 'lucide-react';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { AdminMobileMenu } from '@/components/admin/AdminMobileMenu';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/admin');
    }

    // Check if user is admin
    const { data: adminData } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

    if (!adminData) {
        redirect('/?error=unauthorized');
    }

    const navItems = [
        { icon: 'LayoutDashboard' as const, label: 'Dashboard', href: '/admin' },
        { icon: 'MessageSquare' as const, label: 'Inquiries', href: '/admin/inquiries' },
        { icon: 'Package' as const, label: 'Products', href: '/admin/products' },
        { icon: 'Ticket' as const, label: 'Coupons', href: '/admin/coupons' },
        { icon: 'ShoppingCart' as const, label: 'Orders', href: '/admin/orders' },
        { icon: 'Video' as const, label: 'Video Bookings', href: '/admin/bookings' },
        { icon: 'Users' as const, label: 'Customers', href: '/admin/customers' },
        { icon: 'Mail' as const, label: 'Subscribers', href: '/admin/subscribers' },
        { icon: 'Globe' as const, label: 'SEO', href: '/admin/seo' },
        { icon: 'Settings' as const, label: 'Settings', href: '/admin/settings' },
    ];

    const ICON_MAP = {
        LayoutDashboard,
        MessageSquare,
        Package,
        Ticket,
        ShoppingCart,
        Video,
        Users,
        Mail,
        Globe,
        Settings
    };

    return (
        <div className="min-h-screen flex bg-zinc-50/50">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-72 border-r bg-white flex-col sticky top-0 h-screen">
                <div className="p-8 border-b">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo_wide.webp" alt="ABC Toyz" className="h-8" />
                    </Link>
                    <div className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded w-fit mt-3">Admin Panel</div>
                </div>

                <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP] || LayoutDashboard;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-zinc-100 transition-all group font-bold text-sm text-zinc-600 hover:text-zinc-900"
                            >
                                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t space-y-2">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-zinc-100 transition-all font-bold text-sm text-zinc-600"
                    >
                        <Home className="w-5 h-5 text-zinc-400" />
                        <span>View Store</span>
                    </Link>
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-rose-50 text-rose-600 transition-all font-bold text-sm mt-1"
                        >
                            <LogOut className="w-5 h-5 text-red-300" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Top Bar */}
                <div className="md:hidden flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                    <Link href="/admin">
                        <img src="/logo_wide.webp" alt="ABC Toyz" className="h-6" />
                    </Link>
                    <AdminMobileMenu navItems={navItems} />
                </div>

                <div className="p-4 md:p-10 lg:p-12 pb-32 md:pb-10">
                    {children}
                </div>
            </main>
            <AdminBottomNav />
        </div>
    );
}
