import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
    id: string;
    variantId?: string; // Optional: specific variant ID
    name: string;
    price: number;
    regularPrice?: number | null; // Added for Discount tracking
    mrp?: number | null;          // Added for Discount tracking
    image: string;
    quantity: number;
    attributes?: Record<string, string>; // e.g. { Color: "Red" }
}

interface RecentlyViewedItem {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    category?: string;
    rating?: number;
}

interface AppState {
    cart: CartItem[];
    recentlyViewed: RecentlyViewedItem[];
    addToRecentlyViewed: (product: RecentlyViewedItem) => void;
    clearRecentlyViewed: () => void;
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
            recentlyViewed: [],
            isCartOpen: false,
            addToRecentlyViewed: (product) =>
                set((state) => {
                    // Filter out any existing instance of this product
                    const filtered = state.recentlyViewed.filter(p => p.id !== product.id);
                    // Add to front of array, limit to 10
                    return {
                        recentlyViewed: [product, ...filtered].slice(0, 10)
                    };
                }),
            clearRecentlyViewed: () => set({ recentlyViewed: [] }),
            addToCart: (item) =>
                set((state) => {
                    const existing = state.cart.find((i) =>
                        i.id === item.id && i.variantId === item.variantId
                    );
                    if (existing) {
                        return {
                            cart: state.cart.map((i) =>
                                (i.id === item.id && i.variantId === item.variantId)
                                    ? { ...i, quantity: i.quantity + 1 } : i
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
