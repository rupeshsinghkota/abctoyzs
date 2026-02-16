"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function ProfileSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/profile' },
        { icon: Package, label: 'Orders', href: '/orders' },
        { icon: MapPin, label: 'Addresses', href: '/profile/addresses' },
        { icon: User, label: 'Account Details', href: '/profile/details' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    return (
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-card border rounded-2xl p-4 sticky top-24">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Hello,</p>
                        <p className="font-bold text-sm">Customer</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all mt-2 text-left"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
