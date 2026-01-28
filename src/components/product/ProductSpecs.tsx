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
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group/item">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover/item:bg-primary/5 group-hover/item:text-primary transition-all duration-300 border border-gray-100/50 shrink-0">
                            {item.icon && <item.icon className="w-4 h-4" strokeWidth={2} />}
                        </div>
                        <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-gray-400 group-hover/item:text-primary transition-colors truncate">
                                {item.label}
                            </span>
                            <span className="text-xs font-black text-gray-900 leading-tight truncate">
                                {item.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <p className="text-[10px] text-gray-400 font-medium">
                    <span className="font-bold text-gray-600">Verified:</span> Specs vary by terrain.
                </p>
            </div>
        </div>
    );
}
