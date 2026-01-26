import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { User, Package, MapPin, CreditCard, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/profile');
    }

    const menuItems = [
        { icon: Package, label: 'My Orders', href: '/orders', badge: '0 Active' },
        { icon: MapPin, label: 'Shipping Addresses', href: '/profile/addresses' },
        { icon: Settings, label: 'Settings', href: '/settings' },
        { icon: HelpCircle, label: 'Help & Support', href: '/support' },
    ];

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent pt-12 pb-8 px-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white p-1 shadow-sm">
                        <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden relative">
                            {/* Placeholder Avatar */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <User className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-heading">My Profile</h1>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                            Member
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div className="px-4 -mt-4">
                <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.badge && (
                                        <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-6">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
