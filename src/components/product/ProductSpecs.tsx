import { Battery, Zap, Gauge, Weight, User, Hourglass, PlugZap, Disc, Radio, Smartphone, Package } from 'lucide-react';
import { Product } from '@/lib/data';

interface ProductSpecsProps {
    specs?: Product['specs'];
    additionalInfo: Record<string, string | number | undefined>;
}

export function ProductSpecs({ specs, additionalInfo }: ProductSpecsProps) {
    if (!specs && Object.keys(additionalInfo).length === 0) return null;

    // Curated specs — only high-value items, short labels & values
    const items = [
        { label: 'Battery', value: specs?.battery, icon: Battery },
        { label: 'Motors', value: specs?.motor, icon: Zap },
        { label: 'Speed', value: shortenSpeed(specs?.speed), icon: Gauge },
        { label: 'Max Load', value: specs?.max_load, icon: Weight },
        { label: 'Seats', value: specs?.seats ? `${specs.seats} Seater` : undefined, icon: Package },
        { label: 'Age', value: specs?.suitable_age || additionalInfo['Recommended Age'], icon: User },
        { label: 'Run Time', value: specs?.run_time, icon: Hourglass },
        { label: 'Charge', value: specs?.charging_time, icon: PlugZap },
        { label: 'Tires', value: shortenTires(specs?.tire_type), icon: Disc },
        { label: 'Control', value: specs?.mobile_app ? 'App + Remote' : (specs?.remote_control ? 'Remote' : 'Manual'), icon: specs?.mobile_app ? Smartphone : Radio },
    ].filter(item => item.value && item.value !== '-');

    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-0">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100/80 last:border-b-0">
                    <div className="flex items-center gap-1.5">
                        {item.icon && <item.icon className="w-3 h-3 text-gray-400" strokeWidth={2} />}
                        <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 text-right">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

// Shorten long speed values like "Variable (Based on Foot Accelerator)" → "Foot Accelerator"
function shortenSpeed(speed?: string): string | undefined {
    if (!speed) return undefined;
    if (speed.length <= 16) return speed;
    // Extract the parenthetical if present
    const match = speed.match(/\((.+?)\)/);
    if (match) return match[1].replace(/^Based on\s*/i, '');
    return speed.slice(0, 16) + '…';
}

// Shorten tire descriptions like "Plastic/ABS with Rubber Grip" → "Rubber Grip"
function shortenTires(tires?: string): string | undefined {
    if (!tires) return undefined;
    if (tires.length <= 14) return tires;
    // Prefer the part after "with" if present
    const withMatch = tires.match(/with\s+(.+)/i);
    if (withMatch) return withMatch[1];
    return tires.slice(0, 14) + '…';
}
