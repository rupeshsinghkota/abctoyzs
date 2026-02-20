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
        <div className="grid grid-cols-2 gap-3">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="flex flex-col gap-2 p-2.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            {item.icon && <item.icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-black text-gray-900 leading-none pl-1">
                        {item.value}
                    </span>
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
