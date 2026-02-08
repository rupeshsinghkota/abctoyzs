import { Metadata } from 'next';
import Link from 'next/link';
import { Scale, Shield, FileText, Globe } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service | Rules & Regulations',
    description: 'Read the terms and conditions for using ABC Toyz. Our policies ensure a fair and safe shopping experience for all our customers.',
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-8">Terms of Service</h1>
                    <p className="text-zinc-500 mb-8 italic">Last updated: February 5, 2024</p>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">1. Acceptance of Terms</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            By accessing and using <strong>ABC Toyz</strong> (abctoyz.in), owned and operated by <strong>D2BCart</strong>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">2. Use License</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            Permission is granted to temporarily download one copy of the materials (information or software) on ABC Toyz's website for personal, non-commercial transitory viewing only.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">3. Disclaimer</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            The materials on ABC Toyz's website are provided on an 'as is' basis. ABC Toyz makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">4. Governing Law</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            These terms and conditions are governed by and construed in accordance with the laws of <strong>India</strong> and you irrevocably submit to the exclusive jurisdiction of the courts in New Delhi, Delhi.
                        </p>
                    </section>

                    <section className="mb-10 border-t border-zinc-100 pt-10">
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-4">Questions?</h2>
                        <p className="text-zinc-600 leading-relaxed">
                            If you have any questions about these Terms, please contact us at <Link href="mailto:support@abctoyz.in" className="text-primary hover:underline">support@abctoyz.in</Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
