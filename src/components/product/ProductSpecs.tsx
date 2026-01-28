import { Package, ShieldCheck, Zap, Gauge, Weight, Battery, Disc, Armchair, Smartphone, Radio, User, Hourglass, PlugZap, Ruler, Scale, Box, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/data';

interface ProductSpecsProps {
    specs?: Product['specs'];
    additionalInfo: Record<string, string | number | undefined>; // We can still pass root props here or map them directly if available in expanded component, but for now we trust page passes them or we add them here.
}

export function ProductSpecs({ specs, additionalInfo }: ProductSpecsProps) {
    if (!specs && Object.keys(additionalInfo).length === 0) return null;

    // Helper to safely get value
    const val = (v: any) => v || '-';

    // The Dirty Dozen (Standardized List)
    const items = [
        // 1. Power Source
        { label: 'Battery', value: specs?.battery || additionalInfo['Battery'], icon: Battery },
        // 2. Power Output
        { label: 'Voltage', value: additionalInfo['Voltage'], icon: Zap },
        // 3. Performance
        { label: 'Motors', value: specs?.motor, icon: Zap },
        { label: 'Max Speed', value: specs?.speed, icon: Gauge },
        // 4. Capacity
        { label: 'Max Load', value: specs?.max_load, icon: Weight },
        { label: 'Seats', value: specs?.seats ? `${specs.seats} Seater` : undefined, icon: Package },
        // 5. Suitability
        { label: 'Age Group', value: specs?.suitable_age || additionalInfo['Recommended Age'], icon: User },
        // 6. Endurance (NEW)
        { label: 'Run Time', value: specs?.run_time, icon: Hourglass },
        // 7. Maintenance (NEW)
        { label: 'Charge Time', value: specs?.charging_time, icon: PlugZap },
        // 8. Ride Quality
        { label: 'Tires', value: specs?.tire_type, icon: Disc },
        // 9. Comfort
        { label: 'Seat Type', value: specs?.seat_material, icon: Armchair },
        // 10. Control (Safety)
        { label: 'Control', value: specs?.mobile_app ? 'App & Remote' : (specs?.remote_control ? '2.4G Remote' : 'Manual'), icon: specs?.mobile_app ? Smartphone : Radio },
        // 11. Logistics
        { label: 'Category', value: additionalInfo['Category'], icon: Box },
    ].filter(item => item.value && item.value !== '-');

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 group">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shadow-sm border border-gray-100 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5 shrink-0">
                                {item.icon && <item.icon className="w-5 h-5" strokeWidth={1.5} />}
                            </div>
                            <div className="absolute -inset-1 bg-primary/20 blur opacity-0 group-hover:opacity-30 transition-opacity rounded-2xl" />
                        </div>
                        <div className="flex flex-col min-w-0 pt-0.5">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 group-hover:text-primary/70 transition-colors truncate mb-1">
                                {item.label}
                            </span>
                            <span className="text-[13px] font-black text-gray-900 leading-tight group-hover:translate-x-1 transition-transform duration-300">
                                {item.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 pt-6 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                        <span className="font-bold text-gray-700">Verified Precision:</span> Performance figures vary based on terrain and rider weight.
                    </p>
                </div>
            </div>
        </div>
    );
}
