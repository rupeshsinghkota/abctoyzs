import { Package, Check, ShieldCheck, Zap, Gauge, Weight, Battery, Disc, Armchair, Smartphone, Radio, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/data';

interface ProductSpecsProps {
    specs?: Product['specs'];
    additionalInfo: Record<string, string | number | undefined>;
}

export function ProductSpecs({ specs, additionalInfo }: ProductSpecsProps) {
    if (!specs && Object.keys(additionalInfo).length === 0) return null;

    // Combine all specs into a list
    const items = [
        ...(specs ? [
            { label: 'Battery', value: specs.battery, icon: Battery },
            { label: 'Motor', value: specs.motor, icon: Zap },
            { label: 'Max Speed', value: specs.speed, icon: Gauge },
            { label: 'Max Load', value: specs.max_load, icon: Weight },
            { label: 'Seats', value: specs.seats ? `${specs.seats} Seater` : undefined, icon: Package },
            { label: 'Tires', value: specs.tire_type, icon: Disc },
            { label: 'Seat Type', value: specs.seat_material, icon: Armchair },
            { label: 'Control', value: specs.mobile_app ? 'App Control' : (specs.remote_control ? 'Remote' : undefined), icon: specs.mobile_app ? Smartphone : Radio },
            { label: 'Age Range', value: specs.suitable_age, icon: User },
        ] : []),
        { label: 'Voltage', value: additionalInfo['Voltage'], icon: Zap },
        { label: 'Age Group', value: additionalInfo['Recommended Age'], icon: Check },
        { label: 'Category', value: additionalInfo['Category'], icon: Package },
    ].filter(item => item.value);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 shadow-sm border border-gray-100/50 shrink-0">
                            {item.icon && <item.icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-primary/60 transition-colors truncate w-full">{item.label}</span>
                            <span className="text-sm font-bold text-gray-900 leading-tight truncate w-full">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                        Figures derived under standard testing conditions.
                    </p>
                </div>
            </div>
        </div>
    );
}
