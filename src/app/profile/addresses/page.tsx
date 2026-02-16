"use client";

import { useEffect, useState } from 'react';
import { ProfileService, Address } from '@/lib/services/profile';
import { Plus, MapPin, Trash2, Loader2, Home, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';

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
        <div className="min-h-screen bg-background pb-24">
            <div className="bg-primary/5 py-12 mb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold font-heading">Addresses</h1>
                    <p className="text-muted-foreground mt-2">Manage your shipping addresses for checkout.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
                <ProfileSidebar />

                <div className="flex-1">
                    {addresses.length === 0 ? (
                        <div className="text-center py-16 bg-card border rounded-2xl">
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
                        <div className="grid md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} className="p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all relative group flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Home className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold block text-sm">{addr.name}</span>
                                                {addr.is_default && (
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Default</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                            title="Delete Address"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="text-sm text-foreground/80 leading-relaxed flex-1 pl-10 border-l ml-3.5 mb-2">
                                        <p>{addr.address_line1}</p>
                                        {addr.address_line2 && <p>{addr.address_line2}</p>}
                                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground pl-10 ml-3.5 pt-2 border-t mt-auto">
                                        <Phone className="w-3.5 h-3.5" />
                                        {addr.phone}
                                    </div>
                                </div>
                            ))}

                            <Link
                                href="/profile/addresses/new"
                                className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-muted-foreground/20 rounded-2xl text-muted-foreground font-medium hover:bg-muted/50 hover:border-primary/50 hover:text-primary transition-all min-h-[200px]"
                            >
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span>Add Another Address</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
