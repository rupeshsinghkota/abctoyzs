import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
    quantity: number;
    setQuantity: (q: number) => void;
    min?: number;
    max?: number;
    className?: string;
}

export function QuantitySelector({ quantity, setQuantity, min = 1, max = 10, className = "" }: QuantitySelectorProps) {
    const increment = () => setQuantity(Math.min(quantity + 1, max));
    const decrement = () => setQuantity(Math.max(quantity - 1, min));

    return (
        <div className={`flex items-center bg-gray-100 dark:bg-zinc-800 rounded-xl ${className}`}>
            <button
                onClick={decrement}
                disabled={quantity <= min}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 disabled:opacity-40 transition-all"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-black text-lg">{quantity}</span>
            <button
                onClick={increment}
                disabled={quantity >= max}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 disabled:opacity-40 transition-all"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}
