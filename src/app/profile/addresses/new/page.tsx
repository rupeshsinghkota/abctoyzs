"use client";

import { useState } from 'react';
import { ProfileService } from '@/lib/services/profile';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewAddressPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await ProfileService.addAddress(formData);
            router.push('/profile/addresses');
            router.refresh();
        } catch (error) {
            alert('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <Link href="/profile/addresses" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">Add New Address</h1>
            </div>

            <div className="max-w-lg mx-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Contact Details</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input
                                name="name"
                                placeholder="Full Name"
                                required
                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <input
                                name="phone"
                                placeholder="Phone Number"
                                required
                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Address Info</h3>
                        <input
                            name="address_line1"
                            placeholder="House No, Building, Street"
                            required
                            className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={formData.address_line1}
                            onChange={handleChange}
                        />
                        <input
                            name="address_line2"
                            placeholder="Area / Landmark (Optional)"
                            className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={formData.address_line2}
                            onChange={handleChange}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                name="city"
                                placeholder="City"
                                required
                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <input
                                name="pincode"
                                placeholder="Pincode"
                                required
                                className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>
                        <input
                            name="state"
                            placeholder="State"
                            required
                            className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={formData.state}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            name="is_default"
                            id="is_default"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_default" className="text-sm font-medium">Set as default address</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Address</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
