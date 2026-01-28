import { Package, Check, ShieldCheck, Zap, Gauge, Weight, Battery } from 'lucide-react';
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
        ] : []),
        { label: 'Voltage', value: additionalInfo['Voltage'], icon: Zap },
        { label: 'Age Group', value: additionalInfo['Recommended Age'], icon: Check },
        { label: 'Category', value: additionalInfo['Category'], icon: Package },
    ].filter(item => item.value);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-5 group">
                        <div className="w-14 h-14 rounded-[20px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 shadow-sm border border-gray-100/50">
                            {item.icon && <item.icon className="w-6 h-6" strokeWidth={1.5} />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-primary/60 transition-colors">{item.label}</span>
                            <span className="text-lg font-black text-gray-900 leading-none">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                        Figures derived under standard testing conditions. Actual performance may vary based on load & terrain.
                    </p>
                </div>
            </div>
        </div>
    );
}
