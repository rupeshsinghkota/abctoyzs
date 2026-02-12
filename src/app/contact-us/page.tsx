import { Metadata } from 'next';
import ContactUsClient from './ContactUsClient';

import { SettingsService } from '@/lib/services/settings';

export async function generateMetadata(): Promise<Metadata> {
    const globalSEO = await SettingsService.getSEOConfig();
    const pageSEO = await SettingsService.getSegmentSEO('page_contact-us');

    const title = pageSEO.defaultTitle || globalSEO.defaultTitle;
    const description = pageSEO.defaultDescription || globalSEO.defaultDescription;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: globalSEO.ogImage ? [{ url: globalSEO.ogImage }] : [],
        }
    };
}

export default function ContactUsPage() {
    return <ContactUsClient />;
}
