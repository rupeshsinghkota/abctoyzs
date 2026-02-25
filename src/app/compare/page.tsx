"use client";

import { useStore } from '@/store/useStore';
import { getProductsByIds } from '@/lib/data';
import { Product } from '@/lib/data';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ArrowLeft, Check, Minus, ShoppingCart, Star, Zap, Gauge, Battery, Gamepad2, Move, Ruler, Weight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const COMPARISON_SPEC_MAP = [
    { label: 'Price', key: 'price', format: (v: number) => `₹${v.toLocaleString()}` },
    { label: 'Battery', key: 'specs.battery', icon: Battery },
    { label: 'Motors', key: 'specs.motor', icon: Zap },
    { label: 'Voltage', key: 'voltage', icon: Gauge },
    { label: 'Suitable Age', key: 'ageGroup', icon: Move },
    { label: 'Max Load', key: 'specs.max_load', icon: Weight },
    { label: 'Speed', key: 'specs.speed', icon: Gauge },
    { label: 'Remote Control', key: 'specs.remote_control', icon: Gamepad2, type: 'boolean' },
    { label: 'Seat Material', key: 'specs.seat_material', icon: Move },
    { label: 'Tire Type', key: 'specs.tire_type', icon: Move },
    { label: 'Run Time', key: 'specs.run_time', icon: Move },
    { label: 'Charging Time', key: 'specs.charging_time', icon: Move },
];

export default function ComparePage() {
    const { compareItems, removeFromCompare, addToCart } = useStore();
    const [fullProducts, setFullProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (compareItems.length === 0) {
                setLoading(false);
                return;
            }
            const ids = compareItems.map(item => item.id);
            const products = await getProductsByIds(ids);

            // Maintain the order of compareItems
            const ordered = ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
            setFullProducts(ordered);
            setLoading(false);
        };
        fetchDetails();
    }, [compareItems]);

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    if (compareItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50">
                    <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                        <ArrowLeft className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 mb-2">Comparison is Empty</h1>
                    <p className="text-zinc-500 mb-8 max-w-sm text-center font-medium">Add some products from the shop to start comparing their features side-by-side.</p>
                    <Link href="/shop" className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                        Go to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1600px] mx-auto px-4 py-8 md:py-12">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/shop" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-zinc-900" />
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Compare <span className="text-primary">Products</span></h1>
                        <p className="text-zinc-500 font-medium">{fullProducts.length} items currently selected</p>
                    </div>
                </div>

                <div className="relative overflow-x-auto no-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-20 bg-white min-w-[200px] p-4 text-left border-b border-zinc-100">
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Features</span>
                                </th>
                                {fullProducts.map((p) => (
                                    <th key={p.id} className="min-w-[280px] md:min-w-[320px] p-6 text-center border-b border-zinc-100 bg-white align-top">
                                        <div className="relative group">
                                            <button
                                                onClick={() => removeFromCompare(p.id)}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-zinc-100 opacity-0 group-hover:opacity-100 z-10"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-50 mb-4 border border-zinc-100">
                                                <Image
                                                    src={p.image}
                                                    alt={p.name}
                                                    width={400}
                                                    height={400}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <h3 className="text-sm md:text-base font-bold text-zinc-900 mb-2 line-clamp-2 h-10 md:h-12">{p.name}</h3>
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <span className="text-xl font-black text-zinc-900">₹{p.price.toLocaleString()}</span>
                                                {p.mrp && p.mrp > p.price && (
                                                    <span className="text-xs text-zinc-400 line-through">₹{p.mrp.toLocaleString()}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => addToCart({
                                                    id: p.id,
                                                    name: p.name,
                                                    price: p.price,
                                                    image: p.image,
                                                    quantity: 1,
                                                    attributes: {}
                                                })}
                                                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primary transition-colors mb-4"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                Add to Cart
                                            </button>
                                            <Link
                                                href={`/product/${p.slug}`}
                                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors block border-b border-transparent hover:border-primary w-fit mx-auto"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_SPEC_MAP.map((spec, sIdx) => (
                                <tr key={spec.key} className={sIdx % 2 === 0 ? "bg-zinc-50/50" : "bg-white"}>
                                    <td className="sticky left-0 z-10 bg-inherit p-4 md:p-6 border-b border-zinc-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center gap-2">
                                            {spec.icon && <spec.icon className="w-4 h-4 text-zinc-400" />}
                                            <span className="text-[11px] md:text-xs font-bold text-zinc-500 uppercase tracking-wider">{spec.label}</span>
                                        </div>
                                    </td>
                                    {fullProducts.map((p) => {
                                        const value = getNestedValue(p, spec.key);
                                        return (
                                            <td key={p.id} className="p-4 md:p-6 text-center border-b border-zinc-100">
                                                {spec.type === 'boolean' ? (
                                                    <div className="flex justify-center">
                                                        {value ? (
                                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                                <Check className="w-4 h-4 text-green-600" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                                <Minus className="w-4 h-4 text-red-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-black text-zinc-900">
                                                        {spec.format ? spec.format(value) : (value || '-')}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
