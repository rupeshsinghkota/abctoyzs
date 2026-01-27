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
        <div className="bg-gray-50 dark:bg-muted/10 rounded-2xl p-6 border border-border/50">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.label}</span>
                        </div>
                        <span className="font-bold text-sm text-foreground">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>All specifications are tested under standard conditions. Actual performance may vary based on load, terrain, and usage.</p>
            </div>
        </div>
    );
}
