import { Metadata } from 'next';
import AboutUsClient from './AboutUsClient';

export const metadata: Metadata = {
    title: 'About Us | Our Story & Mission',
    description: 'Learn about ABC Toyz (A Brand of D2BCart), India\'s premium ride-on toy store. Our mission is to provide safe, high-quality electric cars and bikes for your children.',
    openGraph: {
        title: 'About ABC Toyz - Premium Kids Ride-ons',
        description: 'Fueling the next generation of adventures with safety-certified ride-on toys by D2BCart.',
    }
};

export default function AboutUsPage() {
    return <AboutUsClient />;
}
