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
    Settings
} from 'lucide-react';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';

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
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: LayoutDashboard, label: 'Inquiries', href: '/admin/inquiries' },
        { icon: Package, label: 'Products', href: '/admin/products' },
        { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
        { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
        { icon: Users, label: 'Customers', href: '/admin/customers' },
        { icon: Mail, label: 'Subscribers', href: '/admin/subscribers' },
        { icon: Globe, label: 'SEO', href: '/admin/seo' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 border-r bg-card flex-col">
                <div className="p-6 border-b">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo_wide.png" alt="ABC Toyz" className="h-8" />
                    </Link>
                    <p className="text-xs text-muted-foreground mt-2">Admin Dashboard</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors group"
                            >
                                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                <span className="font-medium text-foreground/80 group-hover:text-primary">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">View Store</span>
                    </Link>
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors mt-1"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Top Bar */}
                <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-20">
                    <Link href="/admin">
                        <img src="/logo_wide.png" alt="ABC Toyz" className="h-6" />
                    </Link>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest">Admin</div>
                </div>

                <div className="p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </div>
            </main>
            <AdminBottomNav />
        </div>
    );
}
