import { Metadata } from 'next';
import Link from "next/link";
import { RefreshCcw, AlertCircle, Video, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
    title: 'Refund & Return Policy | 10-Day Replacement',
    description: 'Check our hassle-free 10-day replacement policy. Learn about our unboxing video requirement and how to file a claim.',
};

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-16">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-8">Refund & Return Policy</h1>
                    <p className="text-zinc-500 mb-8 italic">Last updated: February 5, 2024</p>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-10">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-amber-900 mb-2">Important Notice: Unboxing Video Mandatory</h3>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    To protect our customers and ensure a smooth claim process, an <strong>unboxing video is mandatory</strong> for all claims regarding damage, missing items, or manufacturing defects. Claims without a clear, continuous unboxing video will not be entertained.
                                </p>
                            </div>
                        </div>
                    </div>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCcw className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">10-Day Replacement Policy</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            At <strong>ABC Toyz</strong> (A Brand of <strong>D2BCart</strong>), we want you and your little ones to be thrilled with your purchase. We offer a <strong>10-day replacement window</strong> for any items received with manufacturing defects or shipping damage.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600">
                            <li>Replacements are only available for defective/damaged products.</li>
                            <li>Returns for "change of mind" are not accepted due to the high shipping costs of large items.</li>
                            <li>The item must be in its original packaging with all accessories included.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Video className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">How to File a Claim</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            If you receive a damaged or defective product, please follow these steps:
                        </p>
                        <ol className="list-decimal pl-6 space-y-4 text-zinc-600">
                            <li>
                                <strong>Record Unboxing:</strong> Start recording <em>before</em> you open the package. Show the shipping label clearly, and keep the camera running without pauses until the product is assembled or tested.
                            </li>
                            <li>
                                <strong>Contact Us:</strong> Email your claim to <Link href="mailto:support@abctoyz.in" className="text-primary hover:underline">support@abctoyz.in</Link> within 48 hours of delivery.
                            </li>
                            <li>
                                <strong>Provide Proof:</strong> Attach the unboxing video and high-resolution photos of the defect/damage.
                            </li>
                        </ol>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-zinc-800">Refund Process</h2>
                        </div>
                        <p className="text-zinc-600 leading-relaxed mb-4">
                            If a replacement is not available, a refund will be processed to your original payment method within <strong>5-7 business days</strong> after the returned item passes our quality check.
                        </p>
                    </section>

                    <section className="mb-10 border-t border-zinc-100 pt-10">
                        <h2 className="text-2xl font-semibold text-zinc-800 mb-4">Contact for Claims</h2>
                        <p className="text-zinc-600 leading-relaxed">
                            Email: <Link href="mailto:support@abctoyz.in" className="text-primary hover:underline">support@abctoyz.in</Link><br />
                            WhatsApp: +91 80004 21913
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
