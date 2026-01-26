import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface AppState {
    cart: CartItem[];
    isCartOpen: boolean;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            cart: [],
            isCartOpen: false,
            addToCart: (item) =>
                set((state) => {
                    const existing = state.cart.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            cart: state.cart.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        };
                    }
                    return { cart: [...state.cart, item] };
                }),
            updateQuantity: (id: string, quantity: number) =>
                set((state) => ({
                    cart: state.cart.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
                    ),
                })),
            removeFromCart: (id) =>
                set((state) => ({
                    cart: state.cart.filter((i) => i.id !== id),
                })),
            clearCart: () => set({ cart: [] }),
            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
        }),
        {
            name: 'abctoyz-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
