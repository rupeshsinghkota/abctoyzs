"use client";

import { useEffect, useState } from 'react';
import { ProfileService, Address } from '@/lib/services/profile';
import { Plus, MapPin, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadAddresses();
    }, []);

    async function loadAddresses() {
        try {
            const data = await ProfileService.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await ProfileService.deleteAddress(id);
            loadAddresses(); // Refresh list
        } catch (error) {
            alert('Failed to delete address');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">My Addresses</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto">
                {addresses.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">No addresses saved</h3>
                        <p className="text-muted-foreground mb-6">Add a shipping address for faster checkout.</p>
                        <Link
                            href="/profile/addresses/new"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-full"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Address
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="p-4 border rounded-xl bg-card shadow-sm relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold block">{addr.name}</span>
                                        <span className="text-sm text-muted-foreground">{addr.phone}</span>
                                    </div>
                                    {addr.is_default && (
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                                    )}
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {addr.address_line1}<br />
                                    {addr.address_line2 && <>{addr.address_line2}<br /></>}
                                    {addr.city}, {addr.state} - {addr.pincode}
                                </p>

                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="absolute bottom-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100" // Always show on mobile? Maybe better not to hide.
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {/* Mobile Delete Button (Separate for usability) */}
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="md:hidden mt-4 text-xs text-red-500 font-medium flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            </div>
                        ))}

                        <Link
                            href="/profile/addresses/new"
                            className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-muted-foreground/20 rounded-xl text-muted-foreground font-medium hover:bg-muted/50 hover:border-primary/50 hover:text-primary transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Another Address
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
