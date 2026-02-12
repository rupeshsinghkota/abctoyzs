'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface FilterOption {
    label: string;
    value: string;
}

interface ProductFiltersProps {
    className?: string;
    hiddenFilters?: ('price' | 'voltage' | 'age' | 'seats')[];
}

const VOLTAGE_OPTIONS: FilterOption[] = [
    { label: '12V', value: '12V' },
    { label: '24V', value: '24V' },
    { label: '36V', value: '36V' },
    { label: '48V', value: '48V' },
];

import { AGE_CATEGORIES } from '@/lib/data';

const AGE_OPTIONS: FilterOption[] = AGE_CATEGORIES.map(cat => ({
    label: cat.label,
    value: cat.value
}));

const SEATS_OPTIONS: FilterOption[] = [
    { label: '1 Seat', value: '1' },
    { label: '2 Seats', value: '2' },
    { label: '4 Seats', value: '4' },
];

export function ProductFilters({ className, hiddenFilters = [] }: ProductFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isOpen, setIsOpen] = useState(false);

    // State for filters
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [selectedVoltages, setSelectedVoltages] = useState<string[]>([]);
    const [selectedAges, setSelectedAges] = useState<string[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Initialize from URL
    useEffect(() => {
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 100000;
        setPriceRange([minPrice, maxPrice]);

        const voltages = searchParams.get('voltage')?.split(',') || [];
        setSelectedVoltages(voltages);

        const ages = searchParams.get('age')?.split(',') || [];
        setSelectedAges(ages);

        const seats = searchParams.get('seats')?.split(',') || [];
        setSelectedSeats(seats);
    }, [searchParams]);

    const updateFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Price
        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
        else params.delete('minPrice');

        if (priceRange[1] < 100000) params.set('maxPrice', priceRange[1].toString());
        else params.delete('maxPrice');

        // Voltage
        if (selectedVoltages.length > 0) params.set('voltage', selectedVoltages.join(','));
        else params.delete('voltage');

        // Age
        if (selectedAges.length > 0) params.set('age', selectedAges.join(','));
        else params.delete('age');

        // Seats
        if (selectedSeats.length > 0) params.set('seats', selectedSeats.join(','));
        else params.delete('seats');

        // Reset page to 1 if pagination exists (optional but good practice)
        params.delete('page');

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        setIsOpen(false);
    };

    const clearFilters = () => {
        setPriceRange([0, 100000]);
        setSelectedVoltages([]);
        setSelectedAges([]);
        setSelectedSeats([]);
        router.push(pathname, { scroll: false });
        setIsOpen(false);
    };

    const toggleSelection = (value: string, current: string[], setter: (val: string[]) => void) => {
        if (current.includes(value)) {
            setter(current.filter(item => item !== value));
        } else {
            setter([...current, value]);
        }
    };

    const activeCount = [
        selectedVoltages.length > 0,
        selectedAges.length > 0,
        selectedSeats.length > 0,
        priceRange[0] > 0 || priceRange[1] < 100000
    ].filter(Boolean).length;

    return (
        <div className={className}>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-full text-sm font-medium transition-colors"
            >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {activeCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-bold">Filters</h2>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Price Range */}
                                {!hiddenFilters.includes('price') && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Price Range</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Min</label>
                                                <input
                                                    type="number"
                                                    value={priceRange[0]}
                                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                                    className="w-full p-2 border rounded-md text-sm"
                                                    min={0}
                                                />
                                            </div>
                                            <span className="text-muted-foreground">-</span>
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Max</label>
                                                <input
                                                    type="number"
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                                    className="w-full p-2 border rounded-md text-sm"
                                                    min={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Voltage */}
                                {!hiddenFilters.includes('voltage') && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Voltage</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {VOLTAGE_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => toggleSelection(opt.value, selectedVoltages, setSelectedVoltages)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-md text-sm border transition-all",
                                                        selectedVoltages.includes(opt.value)
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-background hover:bg-muted border-input"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Age Group */}
                                {!hiddenFilters.includes('age') && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Age Group</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {AGE_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => toggleSelection(opt.value, selectedAges, setSelectedAges)}
                                                    className={cn(
                                                        "px-3 py-2 rounded-md text-sm border text-left flex items-center justify-between transition-all",
                                                        selectedAges.includes(opt.value)
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-background hover:bg-muted border-input"
                                                    )}
                                                >
                                                    {opt.label}
                                                    {selectedAges.includes(opt.value) && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Seats */}
                                {!hiddenFilters.includes('seats') && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Seats</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {SEATS_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => toggleSelection(opt.value, selectedSeats, setSelectedSeats)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-md text-sm border transition-all",
                                                        selectedSeats.includes(opt.value)
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-background hover:bg-muted border-input"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t bg-muted/20 flex gap-3">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 px-4 py-2 border rounded-full text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={updateFilters}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Show Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
