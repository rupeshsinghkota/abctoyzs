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
      siteName: "abctoyz",
      title: config.defaultTitle,
      description: config.defaultDescription,
      images: [
        {
          url: config.ogImage,
          width: 1200,
          height: 630,
          alt: "abctoyz Premium Ride-ons",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.defaultTitle,
      description: config.defaultDescription,
      images: [config.ogImage],
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "abctoyz",
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
          "min-h-screen bg-background font-sans antialiased",
          plusJakarta.variable
        )}
      >
        {/* Google Analytics - GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>

        {/* Facebook Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'XXXXXXXXXXXXXXX');
            fbq('track', 'PageView');
          `}
        </Script>
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
