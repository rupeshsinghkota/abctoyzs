import { Metadata } from 'next';
import ContactUsClient from './ContactUsClient';

export const metadata: Metadata = {
    title: 'Contact Us | Customer Support & Showroom',
    description: 'Get in touch with ABC Toyz for inquiries regarding our premium ride-on cars, bikes, and jeeps. Visit our showroom in Jhandewalan Market, Delhi.',
    openGraph: {
        title: 'Contact ABC Toyz - Customer Support',
        description: 'Have a question? Our support team is here to help you with your kids\' premium ride-on toys.',
    }
};

export default function ContactUsPage() {
    return <ContactUsClient />;
}
