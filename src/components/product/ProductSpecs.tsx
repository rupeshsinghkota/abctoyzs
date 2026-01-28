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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-5">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 shadow-sm border border-gray-100/50 shrink-0 mt-0.5">
                            {item.icon && <item.icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-primary/60 transition-colors truncate w-full">{item.label}</span>
                            <span className="text-sm font-bold text-gray-900 leading-tight truncate w-full">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-5 border-t border-gray-100">
                <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                        *Performance figures (speed, run time) vary based on rider weight, terrain, and battery charge level.
                    </p>
                </div>
            </div>
        </div>
    );
}
