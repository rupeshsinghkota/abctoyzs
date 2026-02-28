"use client";

import { useStore } from "@/store/useStore";
import { ProductBookingDrawer } from "./product/ProductBookingDrawer";

export function GlobalBookingDrawerWrap() {
    const { isBookingOpen, closeBooking, bookingContext } = useStore();

    if (!bookingContext) return null;

    return (
        <ProductBookingDrawer
            isOpen={isBookingOpen}
            onClose={closeBooking}
            productId={bookingContext.productId}
            productName={bookingContext.productName}
            productPrice={bookingContext.productPrice}
        />
    );
}
