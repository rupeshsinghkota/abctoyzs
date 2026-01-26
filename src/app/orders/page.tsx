import { Package } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OrdersPage() {
    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">My Orders</h1>
            </div>

            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                    Looks like you haven't bought any toys yet. Start shopping to fill your garage!
                </p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        </div>
    );
}
