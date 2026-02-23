/**
 * Global Brand Configuration for ABC Toyz
 * Use this file to update your store name, tagline, and AI personality.
 */

export const BRAND_CONFIG = {
    name: "ABC Toyz",
    fullName: "ABC Toyz Premium Ride-Ons",
    tagline: "Premium Rides for Little Legends",
    voice: "Premium, exciting, and trustworthy. We speak to the joy of childhood and the satisfaction of parents. Professional yet playful.",
    logo: "/logo.png",
    logoWide: "/logo_wide.png",
    marketingPillars: [
        "Unmatched safety and parent-tested quality",
        "Most realistic designs and authentic features",
        "Premium customer support and fast shipping",
        "The largest collection of luxury ride-on vehicles"
    ],

    // Specific instructions for the AI
    aiInstructions: {
        tone: "Sophisticated yet playful",
        reinforceBrand: true,
        brandingFrequency: "2-3 mentions per description"
    },

    // Payment & Trust Settings
    payment: {
        codAdvanceAmount: 500,
        codAdvanceType: 'fixed', // 'fixed' | 'percentage'
        prepaidDiscountPercentage: 5,
        prepaidCouponCode: "PREPAID5"
    }
};
