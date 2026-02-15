import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { BackToTop } from "@/components/ui/BackToTop";
import { SettingsService } from "@/lib/services/settings";
import { createClient } from "@/lib/supabase/server";
import Script from "next/script";
import { Suspense } from "react";
import GoogleTracking from "@/components/tracking/GoogleTracking";
import FacebookPixel from "@/components/tracking/FacebookPixel";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const config = await SettingsService.getSEOConfig(supabase);

  return {
    title: {
      default: config.defaultTitle,
      template: config.titleTemplate
    },
    description: config.defaultDescription,
    metadataBase: new URL('https://abctoyz.in'),
    keywords: config.defaultKeywords,
    authors: [{ name: "ABC Toyz" }],
    creator: "ABC Toyz",
    publisher: "ABC Toyz",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "https://abctoyz.in",
      siteName: "ABC Toyz",
      title: config.defaultTitle,
      description: config.defaultDescription,
      images: [
        {
          url: config.ogImage,
          width: 1200,
          height: 630,
          alt: "ABC Toyz Premium Ride-ons",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.defaultTitle,
      description: config.defaultDescription,
      images: [config.ogImage],
    },
    icons: {
      icon: "/brand-icon.png",
      shortcut: "/brand-icon.png",
      apple: "/brand-icon.png",
      other: {
        rel: "apple-touch-icon-precomposed",
        url: "/brand-icon.png",
      },
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "ABC Toyz",
    },
    verification: {
      google: "BNtsUa5qo3Ap8zwagw-7a84OvxouRy9JxlguB3G2_oI",
    },
  };
}

export const viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          plusJakarta.variable
        )}
      >
        <Suspense fallback={null}>
          <GoogleTracking />
          <FacebookPixel />
        </Suspense>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <Header />
        <main className="relative flex flex-col min-h-screen">
          {children}
        </main>
        <Footer />
        <BottomNav />
        <WhatsAppButton />
        <BackToTop />
      </body>
    </html>
  );
}
