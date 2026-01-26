"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl border bg-card flex items-center justify-center gap-2 text-destructive font-bold hover:bg-destructive/5 transition-colors shadow-sm"
        >
            <LogOut className="w-4 h-4" />
            Log Out
        </button>
    );
}
