"use client";

import { useState, useEffect, use } from 'react';
import { AdminService } from '@/lib/services/admin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Save, Loader2, ImagePlus, X, Zap,
    Users, Gauge, Battery, Smartphone, Tag, Star,
    Package, DollarSign, Hash, Layers, Split,
    Check, Upload, Sparkles, Edit, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import { VEHICLE_CATEGORIES, AGE_CATEGORIES, normalizeAgeGroup } from '@/lib/data';

interface Attribute {
    name: string;
    options: string[]; // Stored as strings, split by comma in UI
    tempOptions: string; // For the input field
}

interface Variant {
    name: string; // e.g. "Red - 12V"
    attributes: Record<string, string>; // { "Color": "Red", "Voltage": "12V" }
    price: string;
    stock: string;
    sku: string;
    image: string;
    ad_creatives?: {
        square: string;
        story: string;
        landscape: string;
    };
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params in Next.js 15
    const { id } = use(params);

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [activeTab, setActiveTab] = useState('media');
    const [isGeneratingReviews, setIsGeneratingReviews] = useState(false);
    const [reviewCount, setReviewCount] = useState(5);
    const [reviewDaysBack, setReviewDaysBack] = useState('30');
    const [reviewStyle, setReviewStyle] = useState('mixed');
    const [productReviews, setProductReviews] = useState<any[]>([]);
    const [brandingIndex, setBrandingIndex] = useState<number | null>(null);
    const [isBrandingAll, setIsBrandingAll] = useState(false);
    const [isGeneratingPosters, setIsGeneratingPosters] = useState(false);
    const [isGeneratingAds, setIsGeneratingAds] = useState(false);
    const [adScene, setAdScene] = useState('Urban Luxe');
    const [adAudience, setAdAudience] = useState('Boy');
    const [generatedPosters, setGeneratedPosters] = useState<string[]>([]);

    // Magic Paste State
    const [rawText, setRawText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);

    // Variations State
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    // State for Image Picker Modal
    const [selectingImageForVariant, setSelectingImageForVariant] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        slug: '',
        name: '',
        description: '',
        base_price: '',
        mrp: '',
        category: 'cars',
        subcategory: '',
        images: [''],
        banners: [] as string[],
        videos: [''],
        box_content: [''],
        voltage: '',
        age_group: '',
        stock: '0',
        is_new: false,
        is_featured: false,
        meta_title: '',
        meta_description: '',
        prompt_notes: '', // context for AI
        product_dimensions: '',
        box_dimensions: '',
        net_weight: '',
        gross_weight: '',
        marketing_suite: {
            action: '',
            comfort: '',
            durability: ''
        },
        ad_creatives: {
            square: '',
            story: '',
            landscape: ''
        },
        specs: {
            battery: '',
            motor: '',
            seats: '1',
            tire_type: '',
            mobile_app: false,
            remote_control: false,
            max_load: '',
            speed: '',
            features: [] as string[],
            charging_time: '',
            run_time: '',
            suitable_age: '',
            seat_material: ''
        }
    });

    // Load Data
    useEffect(() => {
        loadData();
        loadReviews();
    }, [id]);

    async function loadReviews() {
        try {
            const { ReviewService } = await import('@/lib/services/reviews');
            const data = await ReviewService.getProductReviews(id);
            setProductReviews(data);
        } catch (error) {
            console.error("Failed to load reviews", error);
        }
    }

    async function loadData() {
        try {
            const data: any = await AdminService.getProductWithVariants(id);

            // Map product data to form state
            setFormData({
                slug: data.slug || '',
                name: data.name || '',
                description: data.description || '',
                base_price: data.base_price?.toString() || '',
                mrp: data.mrp?.toString() || '',
                category: data.category || 'cars',
                subcategory: data.subcategory || '',
                images: data.images?.length ? data.images : [''],
                banners: data.banners?.length ? data.banners : [] as string[],
                videos: data.videos?.length ? data.videos : [''],
                box_content: data.box_content?.length ? data.box_content : [''],
                voltage: data.voltage || '',
                age_group: data.age_group || '',
                stock: data.stock?.toString() || '0',
                is_new: data.is_new || false,
                is_featured: data.is_featured || false,
                prompt_notes: '', // Notes are ephemeral and not saved in DB usually, or you can save them if you want. 
                // For now, let's keep it empty for fresh prompt on edit.
                product_dimensions: data.product_dimensions || '',
                box_dimensions: data.box_dimensions || '',
                net_weight: data.net_weight || '',
                gross_weight: data.gross_weight || '',
                meta_title: data.meta_title || '',
                meta_description: data.meta_description || '',
                marketing_suite: data.marketing_suite || {
                    action: '',
                    comfort: '',
                    durability: ''
                },
                ad_creatives: data.ad_creatives || {
                    square: '',
                    story: '',
                    landscape: ''
                },
                specs: {
                    battery: data.specs?.battery || '',
                    motor: data.specs?.motor || '',
                    seats: data.specs?.seats?.toString() || '1',
                    tire_type: data.specs?.tire_type || '',
                    mobile_app: data.specs?.mobile_app || false,
                    remote_control: data.specs?.remote_control || false,
                    max_load: data.specs?.max_load || '',
                    speed: data.specs?.speed || '',
                    features: data.specs?.features || [],
                    charging_time: data.specs?.charging_time || '',
                    run_time: data.specs?.run_time || '',
                    suitable_age: data.specs?.suitable_age || '',
                    seat_material: data.specs?.seat_material || ''
                }
            });

            // Map Attributes
            if (data.attributes) {
                setAttributes(data.attributes.map((a: any) => ({
                    name: a.name,
                    options: a.options,
                    tempOptions: a.options.join(', ')
                })));
            }

            // Map Variants
            if (data.variants) {
                setVariants(data.variants.map((v: any) => ({
                    name: v.name,
                    attributes: v.attributes,
                    price: v.price?.toString() || data.base_price?.toString(),
                    stock: v.stock?.toString() || '0',
                    sku: v.sku || '',
                    image: v.image || '',
                    ad_creatives: v.ad_creatives || { square: '', story: '', landscape: '' }
                })));
            }
        } catch (error) {
            console.error("Failed to load product", error);
            alert("Failed to load product data");
        } finally {
            setLoading(false);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => AdminService.uploadFile(file, type));
            const newUrls = await Promise.all(uploadPromises);

            // Filter out empty strings from current list and add new URLs
            const currentList = formData[type].filter(url => url.trim() !== '');
            setFormData({ ...formData, [type]: [...currentList, ...newUrls] });
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };



    const brandImage = async (index: number, sceneOverride?: string, detailsOverride?: string) => {
        const imageUrl = formData.images[index];
        if (!imageUrl) return null;

        // Collect all valid images for product analysis context
        const allValidImages = formData.images.filter(img => img.trim() !== '');

        setBrandingIndex(index);
        try {
            const res = await fetch('/api/admin/ai/image/brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl,
                    imageUrls: allValidImages, // Send all images for comprehensive analysis
                    productName: formData.name,
                    sceneOverride, // Pass consistency context
                    detailsOverride
                })
            });
            let data;
            const resText = await res.text();
            try {
                data = JSON.parse(resText);
            } catch (e) {
                throw new Error(`Invalid response from server. Status: ${res.status}. Help: ${resText.slice(0, 100)}`);
            }

            const { newImageUrl, error, generatedScene, generatedDetails } = data;
            if (error) throw new Error(error);

            setFormData(prev => {
                const freshImages = [...prev.images];
                freshImages[index] = newImageUrl;
                return { ...prev, images: freshImages };
            });
            return { newImageUrl, generatedScene, generatedDetails };
        } catch (error: any) {
            console.error(error);
            alert('Branding failed: ' + error.message);
            return null;
        } finally {
            setBrandingIndex(null);
        }
    };

    const brandAllImages = async () => {
        const imageIndices = formData.images
            .map((img, i) => img.trim() !== '' ? i : -1)
            .filter(i => i !== -1);

        if (imageIndices.length === 0) {
            alert('Please upload some images first');
            return;
        }

        setIsBrandingAll(true);
        try {
            console.log(`Starting Consistent AI Branding (Global Analysis) for ${imageIndices.length} images...`);
            let count = 0;
            let masterScene = "";
            let masterDetails = "";

            // Phase 1: Analyze First Image & Establish Global Context
            if (imageIndices.length > 0) {
                console.log("Phase 1: GLOBAL ANALYSIS - Analyzing all images to decide scene & details...");
                const firstResult = await brandImage(imageIndices[0]);
                if (firstResult) {
                    count++;
                    if (firstResult.generatedScene) {
                        masterScene = firstResult.generatedScene;
                        masterDetails = firstResult.generatedDetails || "";
                        console.log("Global Context Established:");
                        console.log("- Scene:", masterScene);
                        console.log("- Details:", masterDetails);
                    }
                }
            }

            // Phase 2: Process Remaining Images with Fixed Global Context
            const remainingIndices = imageIndices.slice(1);
            const BATCH_SIZE = 2;

            for (let i = 0; i < remainingIndices.length; i += BATCH_SIZE) {
                const batch = remainingIndices.slice(i, i + BATCH_SIZE);
                console.log(`Phase 2: Applying consistent context to batch ${i / BATCH_SIZE + 1}...`);

                await Promise.all(batch.map(async (index) => {
                    const success = await brandImage(index, masterScene);
                    if (success) count++;
                }));
            }

            // Trigger auto-save with final state
            setFormData(prev => {
                AdminService.updateProduct(id, { images: prev.images.filter(i => i.trim()) });
                return prev;
            });

            alert(`✨ Enhanced & Saved ${count} images!`);
        } catch (error: any) {
            console.error(error);
            alert('Image enhancement failed: ' + error.message);
        } finally {
            setIsBrandingAll(false);
        }
    };
    const generateMarketingSuite = async () => {
        // Fallback name logic: If name is empty, try to extract first 5 words from notes
        let effectiveName = formData.name;
        if (!effectiveName && formData.prompt_notes) {
            effectiveName = formData.prompt_notes.split(/\s+/).slice(0, 6).join(' ') + '...';
        }

        if (!effectiveName) {
            alert('Please enter a product name or paste details in the AI center first.');
            return;
        }

        setIsGeneratingPosters(true);
        try {
            // Define 3 key marketing angles
            // Define 3 key marketing angles using REAL SPECS if available
            const specs = formData.specs;

            // Angle 1: SPEED & POWER -> Dynamic Motion Visual
            // Use AI-generated headline if available, otherwise fallback to spec
            const speedText = formData.marketing_suite?.action || specs.speed || specs.motor || "High Speed";

            // Angle 2: COMFORT & KIDS -> Lifestyle Visual
            const comfortText = formData.marketing_suite?.comfort || (specs.seats ? `${specs.seats} Seater` : null) || "Leather Interiors";

            // Angle 3: DURABILITY & LOAD -> Rugged Visual
            const strengthText = formData.marketing_suite?.durability || (specs.max_load ? `Max ${specs.max_load}` : null) || specs.tire_type || "Built Tough";

            const angles = [
                { type: 'Action', text: speedText, style: 'SPEED_MOTION' },
                { type: 'Comfort', text: comfortText, style: 'COMFORT_LIFESTYLE' },
                { type: 'Durability', text: strengthText, style: 'DURABILITY_OFFROAD' }
            ];

            const newBanners: string[] = [];

            for (const angle of angles) {
                const res = await fetch('/api/admin/ai/image/poster', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productName: effectiveName,
                        featureText: angle.text,
                        layoutStyle: angle.style,
                        productNotes: formData.prompt_notes,
                        originalImageUrl: formData.images[0]
                    })
                });
                const { posterUrl, error } = await res.json();
                if (error) throw new Error(error);
                newBanners.push(posterUrl);
            }

            setGeneratedPosters(newBanners);
            setFormData(prev => ({
                ...prev,
                banners: newBanners
            }));

            alert('✨ Marketing Suite Generated! Check the Media tab.');
        } catch (error: any) {
            console.error(error);
            alert('Marketing Suite generation failed: ' + error.message);
        } finally {
            setIsGeneratingPosters(false);
        }
    };

    const generateAdCreatives = async () => {
        if (!formData.name) {
            alert('Product name is required');
            return;
        }
        if (formData.images.length === 0 || !formData.images[0]) {
            alert('Main product image is required');
            return;
        }

        if (isGeneratingAds) return;
        if (variants.length > 0) {
            alert('For variable products, please generate ads in the Variations section or use "Generate All Variant Ads".');
            return;
        }
        setIsGeneratingAds(true);
        try {
            const res = await fetch('/api/admin/ai/image/ad-creatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: formData.name,
                    price: formData.base_price,
                    mrp: formData.mrp,
                    originalImageUrl: formData.images[0],
                    vibe: formData.prompt_notes,
                    mode: 'auto', // Now generates 1 set of 3 distinct environments
                    specs: {
                        voltage: formData.voltage,
                        age: formData.specs?.suitable_age,
                        motor: formData.specs?.motor,
                        speed: formData.specs?.speed,
                        runTime: formData.specs?.run_time,
                        maxLoad: formData.specs?.max_load,
                        seats: formData.specs?.seats,
                        remoteControl: formData.specs?.remote_control,
                    }
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Store directly as an object, NOT an array of modes
            setFormData(prev => ({
                ...prev,
                ad_creatives: data.creatives as any
            }));

            alert('✨ 3 Distinct Ad Styles Generated Successfully!');

        } catch (error: any) {
            console.error('Ad Generation Failed:', error);
            alert('Ad Generation Failed: ' + error.message);
        } finally {
            setIsGeneratingAds(false);
        }
    };

    const generateVariantAds = async (index: number) => {
        const variant = variants[index];
        if (!variant.image) {
            alert('Variant must have an image to generate ads.');
            return;
        }

        if (isGeneratingAds) return;
        setIsGeneratingAds(true);

        try {
            const res = await fetch('/api/admin/ai/image/ad-creatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: `${formData.name} - ${variant.name}`,
                    price: variant.price,
                    mrp: (variant as any).mrp || formData.mrp,
                    originalImageUrl: variant.image,
                    vibe: formData.prompt_notes,
                    mode: 'auto', // Now generates 1 set of 3 distinct environments
                    specs: {
                        voltage: formData.voltage,
                        age: formData.specs?.suitable_age,
                        motor: formData.specs?.motor,
                        speed: formData.specs?.speed,
                        runTime: formData.specs?.run_time,
                        maxLoad: formData.specs?.max_load,
                        seats: formData.specs?.seats,
                        remoteControl: formData.specs?.remote_control,
                    }
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const newVars = [...variants];
            // Store directly as an object, NOT an array of modes
            newVars[index].ad_creatives = data.creatives as any;
            setVariants(newVars);
            alert(`✨ 3 Distinct Ad Styles Generated for ${variant.name}!`);

        } catch (error: any) {
            console.error('Variant Ad Generation Failed:', error);
            alert('Generation Failed: ' + error.message);
        } finally {
            setIsGeneratingAds(false);
        }
    };

    const generateAllVariantAds = async (arg?: any) => {
        const silent = typeof arg === 'boolean' ? arg : false;
        if (isGeneratingAds) return;

        const hasNoAds = (v: any) => {
            if (!v.ad_creatives) return true;
            if (Array.isArray(v.ad_creatives)) return v.ad_creatives.length === 0;
            return !v.ad_creatives.square; // Legacy fallback
        };

        const variantsToGenerate = variants.filter(v => v.image && hasNoAds(v));
        if (variantsToGenerate.length === 0) {
            if (!silent) alert('No eligible variants found (must have an image and no existing ads).');
            return;
        }

        if (!silent && !confirm(`Generate ads for ${variantsToGenerate.length} variants? This might take a minute.`)) return;

        setIsGeneratingAds(true);
        let successCount = 0;
        const newVars = [...variants];

        try {
            for (let i = 0; i < newVars.length; i++) {
                const variant = newVars[i];
                if (variant.image && hasNoAds(variant)) {
                    try {
                        const res = await fetch('/api/admin/ai/image/ad-creatives', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                productName: `${formData.name} - ${variant.name}`,
                                price: variant.price,
                                mrp: (variant as any).mrp || formData.mrp,
                                originalImageUrl: variant.image,
                                vibe: formData.prompt_notes,
                                mode: 'auto', // Generates exactly 3 diverse environments
                                specs: {
                                    voltage: formData.voltage,
                                    age: formData.specs?.suitable_age,
                                    motor: formData.specs?.motor,
                                    speed: formData.specs?.speed,
                                    runTime: formData.specs?.run_time,
                                    maxLoad: formData.specs?.max_load,
                                    seats: formData.specs?.seats,
                                    remoteControl: formData.specs?.remote_control,
                                }
                            })
                        });

                        const data = await res.json();
                        if (data.creatives) {
                            newVars[i].ad_creatives = data.creatives as any;
                            successCount++;
                            // Partial update for UX
                            setVariants([...newVars]);
                        }
                    } catch (err) {
                        console.error(`Failed to generate for ${variant.name}`, err);
                    }
                }
            }
            alert(`✨ Successfully generated ad sets for ${successCount} variants!`);
        } catch (error) {
            alert('Bulk generation stopped due to error.');
        } finally {
            setIsGeneratingAds(false);
        }
    };

    // --- Intelligent Mapping Helpers ---
    const parseAgeGroup = (text?: string) => {
        if (!text) return '';
        const t = text.toLowerCase();
        if (t.includes('1-3') || t.includes('toddler')) return '1-3';
        if (t.includes('3-6') || t.includes('preschool')) return '3-6';
        if (t.includes('6-10') || t.includes('6-12') || t.includes('big kid')) return '6-10';
        if (t.includes('10+') || t.includes('teen') || t.includes('adult')) return '10-plus';
        if (t.includes('1') || t.includes('2')) return '1-3';
        if (t.includes('3') || t.includes('4') || t.includes('5')) return '3-6';
        if (t.includes('7') || t.includes('8') || t.includes('9')) return '6-10';
        return '';
    };

    const parseVoltage = (text?: string) => {
        if (!text) return '';
        const match = text.match(/(\d+)V/i);
        if (match) {
            const v = match[1] + 'V';
            if (['12V', '24V', '36V', '48V'].includes(v)) return v;
        }
        return '';
    };

    // --- Magic Paste Handler ---
    const handleExtractData = async () => {
        if (!rawText.trim()) {
            alert('Please paste some text first!');
            return;
        }

        setIsExtracting(true);
        try {
            const res = await fetch('/api/admin/ai/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: rawText,
                    posters: formData.banners,
                    imageUrls: validImages // Pass images for visual analysis
                })
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);

            // Populate Form
            setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                description: data.description || prev.description,
                category: data.category || 'cars',
                base_price: data.price ? String(data.price) : prev.base_price,
                meta_title: data.meta_title || data.name || prev.meta_title,
                meta_description: data.meta_description || prev.meta_description,
                product_dimensions: data.logistics?.dimensions || prev.product_dimensions,
                gross_weight: data.logistics?.weight || prev.gross_weight,
                box_content: data.logistics?.box_content?.length ? data.logistics.box_content : prev.box_content,
                marketing_suite: data.marketing_suite || prev.marketing_suite,
                specs: {
                    ...prev.specs,
                    battery: data.specs?.battery || '',
                    motor: data.specs?.motor || '',
                    speed: data.specs?.speed || '',
                    max_load: data.specs?.max_load || '',
                    tire_type: data.specs?.tire_type || '',
                    seat_material: data.specs?.seat_material || '',
                    seats: data.specs?.seats ? String(data.specs.seats) : '1',
                    mobile_app: data.specs?.mobile_app === true,
                    remote_control: data.specs?.remote_control === true,
                    suitable_age: data.specs?.suitable_age || '',
                    charging_time: data.specs?.charging_time || '',
                    run_time: data.specs?.run_time || ''
                },
                voltage: parseVoltage(data.specs?.battery) || prev.voltage,
                age_group: normalizeAgeGroup(data.age_group) || normalizeAgeGroup(parseAgeGroup(data.specs?.suitable_age)) || prev.age_group
            }));

            alert('✨ Data Extracted & Form Filled!');
            setRawText('');

        } catch (error: any) {
            console.error(error);
            alert('Extraction failed: ' + error.message);
        } finally {
            setIsExtracting(false);
        }
    };
    // --- Logic ---

    // 1. Generate Variants from Attributes
    const generateVariants = () => {
        if (attributes.length === 0) return;

        // Recursive function to generate cartesian product
        const generate = (index: number, current: Record<string, string>, nameParts: string[]) => {
            if (index === attributes.length) {
                return [{
                    name: nameParts.join(' - '),
                    attributes: { ...current },
                    price: formData.base_price,
                    stock: formData.stock,
                    sku: '',
                    image: formData.images[0] || '',
                    ad_creatives: { square: '', story: '', landscape: '' }
                }];
            }

            const attribute = attributes[index];
            let results: Variant[] = [];

            // If no options, skip
            if (attribute.options.length === 0) return generate(index + 1, current, nameParts);

            for (const option of attribute.options) {
                results = [
                    ...results,
                    ...generate(index + 1, { ...current, [attribute.name]: option }, [...nameParts, option])
                ];
            }
            return results;
        };

        const newVariants = generate(0, {}, []);
        if (newVariants) {
            setVariants(newVariants);
            setActiveTab('variations');
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Prepare Main Product Data (Explicit mapping to match DB schema)
            const productData = {
                id: id,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                name: formData.name,
                description: formData.description,
                base_price: parseFloat(formData.base_price) || 0,
                mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
                category: formData.category,
                subcategory: formData.subcategory,
                stock: parseInt(formData.stock) || 0,
                images: formData.images.filter(img => img.trim()),
                banners: formData.banners,
                videos: formData.videos.filter(v => v.trim()),
                box_content: formData.box_content.filter(i => i.trim()),
                voltage: formData.voltage,
                age_group: formData.age_group,
                is_new: formData.is_new,
                is_featured: formData.is_featured,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                prompt_notes: formData.prompt_notes,
                product_dimensions: formData.product_dimensions,
                box_dimensions: formData.box_dimensions,
                net_weight: formData.net_weight,
                gross_weight: formData.gross_weight,
                marketing_suite: formData.marketing_suite,
                ad_creatives: formData.ad_creatives,
                specs: {
                    ...formData.specs,
                    seats: parseInt(formData.specs.seats) || 1
                },
                attributes: attributes.map(a => ({ name: a.name, options: a.options }))
            };

            // 2. Update Product
            await AdminService.updateProduct(id, productData);

            // 3. Update Variants (Replace All)
            if (variants.length > 0) {
                const variantsPayload = variants.map(v => ({
                    product_id: id,
                    name: v.name,
                    attributes: v.attributes,
                    price: parseFloat(v.price) || 0,
                    stock: parseInt(v.stock) || 0,
                    sku: v.sku,
                    image: v.image,
                    ad_creatives: v.ad_creatives
                }));
                await AdminService.replaceVariants(id, variantsPayload);
            }

            router.push('/admin/products');
            router.refresh(); // Ensure list is updated
        } catch (error) {
            console.error(error);
            alert('Failed to update product. Check console for details.');
            setSaving(false);
        }
    }

    // --- Helper Functions ---
    const updateList = (field: 'images' | 'videos' | 'box_content', index: number, value: string) => {
        const newList = [...formData[field]];
        newList[index] = value;
        setFormData({ ...formData, [field]: newList });
    };

    const addListField = (field: 'images' | 'videos' | 'box_content') => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeListField = (field: 'images' | 'videos' | 'box_content', index: number) => {
        const newList = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newList.length ? newList : [''] });
    };

    const moveImage = (index: number, direction: 'left' | 'right') => {
        const newImages = [...formData.images];
        if (direction === 'left' && index > 0) {
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else if (direction === 'right' && index < newImages.length - 1) {
            [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
        }
        setFormData({ ...formData, images: newImages });
    };

    const addAttribute = () => {
        setAttributes([...attributes, { name: '', options: [], tempOptions: '' }]);
    };

    const updateAttribute = (index: number, field: keyof Attribute, value: any) => {
        const newAttrs = [...attributes];
        (newAttrs[index] as any)[field] = value;

        // Auto-split options on comma
        if (field === 'tempOptions') {
            newAttrs[index].options = (value as string).split(',').map(s => s.trim()).filter(s => s);
        }
        setAttributes(newAttrs);
    };

    const removeAttribute = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: string) => {
        const newVars = [...variants];
        (newVars[index] as any)[field] = value;
        setVariants(newVars);
    };

    const generateAIReviews = async () => {
        if (!confirm(`Generate ${reviewCount} AI reviews for this product?`)) return;

        setIsGeneratingReviews(true);
        try {
            const resp = await fetch('/api/admin/reviews/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: id,
                    productName: formData.name,
                    productDescription: formData.description,
                    count: reviewCount,
                    daysBack: ['2024', '2025'].includes(reviewDaysBack) ? undefined : Number(reviewDaysBack),
                    year: ['2024', '2025'].includes(reviewDaysBack) ? reviewDaysBack : undefined,
                    style: reviewStyle
                })
            });

            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            const { ReviewService } = await import('@/lib/services/reviews');
            await ReviewService.bulkInsertReviews(data.reviews);

            alert(`Successfully generated ${data.reviews.length} reviews!`);
            loadReviews(); // Refresh the list
        } catch (error: any) {
            alert(error.message || "Failed to generate reviews");
        } finally {
            setIsGeneratingReviews(false);
        }
    };

    const tabs = [
        { id: 'media', label: 'Media', icon: ImagePlus },
        { id: 'basic', label: 'Basic Info', icon: Package },
        { id: 'attributes', label: 'Attributes', icon: Layers },
        { id: 'variations', label: 'Variations', icon: Split },
        { id: 'specs', label: 'Tech Specs', icon: Gauge },
        { id: 'logistics', label: 'Logistics', icon: Package },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
        { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    ];

    const validImages = formData.images.filter(img => img.trim());

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/products"
                    className="p-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground mt-1">Update existing product listing</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex overflow-x-auto gap-2 p-1.5 bg-muted rounded-2xl sticky top-[57px] md:top-0 z-10 backdrop-blur-md bg-opacity-90 scrollbar-hide">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-background shadow-sm text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Product Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg"
                                        placeholder="e.g. BMW M5 Competition Ride-On"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">URL Slug (SEO) <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                        className="w-full px-5 py-4 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-mono text-muted-foreground"
                                        placeholder="e.g. bmw-m5-competition-ride-on"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Category <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        >
                                            {VEHICLE_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Age Group <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={formData.age_group}
                                            onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="">Select Age Group</option>
                                            {AGE_CATEGORIES.map(age => <option key={age.value} value={age.value}>{age.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Subcategory</label>
                                        <input
                                            type="text"
                                            value={formData.subcategory}
                                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                            placeholder="e.g. Sports, Luxury"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">SEO Meta Title</label>
                                        <input
                                            type="text"
                                            value={formData.meta_title}
                                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none text-sm"
                                            placeholder="Optimized title for Google"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">SEO Meta Description</label>
                                        <textarea
                                            value={formData.meta_description}
                                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none text-sm resize-none"
                                            placeholder="Brief description for search results"
                                            rows={2}
                                        />
                                    </div>
                                </div>



                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Description <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <div className="flex gap-2">
                                                {/* AI Button Removed */}
                                            </div>
                                        </div>
                                    </div>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={8}
                                        className="w-full px-5 py-4 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono text-sm leading-relaxed"
                                        placeholder="<h3>Amazing Features</h3>\n\n<ul>\n  <li>Feature 1</li>\n  <li>Feature 2</li>\n</ul>\n\n<p>Describe the product...</p>"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2 text-right">HTML supported</p>
                                </div>
                            </div>
                        )}

                        {/* Media Tab (Images & Video) */}
                        {activeTab === 'media' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-8">
                                {/* Images Section */}
                                <div>
                                    <div className="flex flex-col gap-4 mb-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <ImagePlus className="w-4 h-4" /> Product Images
                                            </label>
                                            {formData.images.some(img => img.trim()) && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={generateMarketingSuite}
                                                        disabled={isGeneratingPosters || !formData.name}
                                                        className="text-[10px] sm:text-xs px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg transition-all font-bold flex items-center gap-1.5 hover:shadow-lg shadow-pink-500/20 disabled:opacity-50"
                                                    >
                                                        {isGeneratingPosters ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                        {isGeneratingPosters ? 'Designing Suite...' : '✨ Generate Marketing Suite'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={brandAllImages}
                                                        disabled={isBrandingAll || isUploading}
                                                        className="text-[10px] sm:text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg transition-all font-bold flex items-center gap-1.5 hover:bg-purple-700 shadow-sm disabled:opacity-50"
                                                    >
                                                        {isBrandingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                        {isBrandingAll ? 'Branding All...' : 'Enhance Photos'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Marketing Banners Display */}
                                        {formData.banners && formData.banners.length > 0 && (
                                            <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-pink-100 rounded-2xl">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" /> Marketing Banners (Hero Carousel)
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {formData.banners.map((banner, idx) => (
                                                        <div key={idx} className="relative group aspect-[21/9] rounded-xl overflow-hidden shadow-sm border-2 border-white">
                                                            <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newBanners = formData.banners.filter((_, i) => i !== idx);
                                                                    setFormData({ ...formData, banners: newBanners });
                                                                }}
                                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modern Image Gallery */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {/* Existing Previews */}
                                        {formData.images.map((img, index) => (
                                            img.trim() ? (
                                                <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-all shadow-sm">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                        {index !== 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newImages = [...formData.images];
                                                                    const [moved] = newImages.splice(index, 1);
                                                                    newImages.unshift(moved);
                                                                    setFormData({ ...formData, images: newImages });
                                                                }}
                                                                className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"
                                                            >
                                                                Set as Main
                                                            </button>
                                                        )}
                                                        <div className="flex gap-1 items-center">
                                                            {/* Move Controls */}
                                                            <div className="flex bg-white/20 backdrop-blur-md rounded-lg p-0.5 border border-white/20">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveImage(index, 'left')}
                                                                    disabled={index === 0}
                                                                    className="p-1 hover:bg-white/30 rounded transition-colors disabled:opacity-30"
                                                                >
                                                                    <ChevronLeft className="w-3.5 h-3.5 text-white" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveImage(index, 'right')}
                                                                    disabled={index === formData.images.length - 1 || !formData.images[index + 1]?.trim()}
                                                                    className="p-1 hover:bg-white/30 rounded transition-colors disabled:opacity-30"
                                                                >
                                                                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => brandImage(index)}
                                                                disabled={brandingIndex === index}
                                                                className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                                title="✨ Brand & Enhance with AI"
                                                            >
                                                                {brandingIndex === index ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeListField('images', index)}
                                                                className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {brandingIndex === index && (
                                                        <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4">
                                                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                                            <span className="text-[10px] font-bold text-center uppercase tracking-tighter">Branding & Enhancing...</span>
                                                        </div>
                                                    )}
                                                    {index === 0 && (
                                                        <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg shadow-lg">
                                                            MAIN
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null
                                        ))}

                                        {/* Upload Button Card */}
                                        <label className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isUploading ? 'bg-muted animate-pulse border-muted-foreground' : 'bg-primary/5 border-primary/20 hover:border-primary hover:bg-primary/10'}`}>
                                            {isUploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            ) : (
                                                <Upload className="w-6 h-6 text-primary" />
                                            )}
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider text-center px-2">
                                                {isUploading ? 'Uploading...' : 'Add Photos'}
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'images')}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>

                                    {/* Manual URL Input (Secondary) */}
                                    <div className="mt-6 pt-6 border-t border-dashed">
                                        <button
                                            type="button"
                                            onClick={() => addListField('images')}
                                            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            + Or paste image URLs manually
                                        </button>

                                        {formData.images.some(img => !img.trim()) && (
                                            <div className="mt-3 space-y-2">
                                                {formData.images.map((img, index) => (
                                                    !img.trim() && (
                                                        <div key={index} className="flex gap-2">
                                                            <input
                                                                type="url"
                                                                value={img}
                                                                onChange={(e) => updateList('images', index, e.target.value)}
                                                                className="flex-1 px-4 py-2 bg-muted/30 border-2 rounded-xl text-sm focus:border-primary outline-none"
                                                                placeholder="https://example.com/image.jpg"
                                                            />
                                                            <button type="button" onClick={() => removeListField('images', index)} className="p-2 text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Ad Creatives Section */}
                                <div className="pt-8 border-t border-dashed">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-blue-500" />
                                                AI Ad Creatives {variants.length > 0 && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">Main Product</span>}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {variants.length > 0
                                                    ? "Optional 'General Branding' ads for manual campaigns. (Variants handle the Feed automatically)"
                                                    : "Auto-generated for Feed, Stories, and Audience Network"}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            {variants.length > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!confirm('Generate ads for all eligible Variants?')) return;
                                                        await generateAllVariantAds(true);
                                                    }}
                                                    disabled={isGeneratingAds}
                                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                                                >
                                                    {isGeneratingAds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                    Generate All Variant Ads
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => generateAdCreatives()}
                                                    disabled={isGeneratingAds}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                                >
                                                    {isGeneratingAds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                    Generate Ad Creatives
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        {Array.isArray(formData.ad_creatives) ? (
                                            formData.ad_creatives.map((set, idx) => (
                                                <div key={idx} className="bg-muted/30 p-6 rounded-2xl border border-border">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                            Ad Set {idx + 1}: {set.mode?.toUpperCase() || 'MODERN'}
                                                        </h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Feed Variation 1 */}
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">Variation 1 (Feed)</label>
                                                            <div className="aspect-square bg-muted rounded-xl relative overflow-hidden group border-2 border-transparent hover:border-blue-500 transition-all shadow-sm">
                                                                {set.square ? (
                                                                    <img src={set.square} className="w-full h-full object-cover" alt="Feed Ad 1" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Feed Variation 2 */}
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">Variation 2 (Feed)</label>
                                                            <div className="aspect-square bg-muted rounded-xl relative overflow-hidden group border-2 border-transparent hover:border-blue-500 transition-all shadow-sm">
                                                                {set.story ? (
                                                                    <img src={set.story} className="w-full h-full object-cover" alt="Feed Ad 2" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Feed Variation 3 */}
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">Variation 3 (Feed)</label>
                                                            <div className="aspect-square bg-muted rounded-xl relative overflow-hidden group border-2 border-transparent hover:border-blue-500 transition-all shadow-sm">
                                                                {set.landscape ? (
                                                                    <img src={set.landscape} className="w-full h-full object-cover" alt="Feed Ad 3" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Feed Variation 1 */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-muted-foreground block text-center">Variation 1 (Feed)</label>
                                                    <div className="aspect-square bg-muted rounded-xl relative overflow-hidden group border-2 border-transparent hover:border-blue-500 transition-all">
                                                        {formData.ad_creatives?.square ? (
                                                            <img src={formData.ad_creatives.square} className="w-full h-full object-cover" alt="Feed Ad 1" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Feed Variation 2 */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-muted-foreground block text-center">Variation 2 (Feed)</label>
                                                    <div className="aspect-square bg-muted rounded-xl relative overflow-hidden group border-2 border-transparent hover:border-blue-500 transition-all">
                                                        {formData.ad_creatives?.story ? (
                                                            <img src={formData.ad_creatives.story} className="w-full h-full object-cover" alt="Feed Ad 2" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Feed Variation 3 */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-muted-foreground block text-center">Variation 3 (Feed)</label>
                                                    <div className="aspect-square bg-muted rounded-xl relative overflow-hidden group border-2 border-transparent hover:border-blue-500 transition-all">
                                                        {formData.ad_creatives?.landscape ? (
                                                            <img src={formData.ad_creatives.landscape} className="w-full h-full object-cover" alt="Feed Ad 3" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border-2 border-purple-100 dark:border-purple-500/20 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4" /> AI Automation Center
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleExtractData}
                                                disabled={isExtracting || !rawText}
                                                className="text-[10px] sm:text-xs px-4 py-2 bg-purple-600 text-white rounded-xl transition-all font-bold flex items-center gap-1.5 hover:bg-purple-700 shadow-lg disabled:opacity-50"
                                            >
                                                {isExtracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                {isExtracting ? 'Analyzing...' : 'Extract & Fill Form'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            value={rawText}
                                            onChange={(e) => setRawText(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border rounded-xl text-sm focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                                            placeholder="Paste supplier details, manufacturer notes, or raw product text here for the AI to analyze..."
                                            rows={4}
                                        />
                                        <div className="flex items-center gap-2 text-[10px] text-purple-400 font-medium mt-2">
                                            <Zap className="w-3 h-3" />
                                            <span>Pro Tip: Add images first, then use "Magic Paste" at the top for full details!</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2 border-t border-purple-200/50">
                                        <button
                                            type="button"
                                            onClick={generateMarketingSuite}
                                            disabled={isGeneratingPosters || !formData.name}
                                            className="text-[10px] sm:text-xs px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl transition-all font-bold flex items-center gap-1.5 hover:shadow-lg shadow-pink-500/20 disabled:opacity-50"
                                        >
                                            {isGeneratingPosters ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                                            {isGeneratingPosters ? 'Designing Suite...' : 'Generate Marketing Suite'}
                                        </button>
                                    </div>
                                </div>


                                <div className="h-px bg-border/50" />

                                {/* Videos Section */}
                                <div>
                                    <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Zap className="w-4 h-4" /> Product Videos
                                    </label>
                                    <div className="space-y-3">
                                        {formData.videos.map((vid, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={vid}
                                                    onChange={(e) => updateList('videos', index, e.target.value)}
                                                    className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                    placeholder="https://youtube.com/watch?v=... or .mp4 link"
                                                />
                                                {formData.videos.length > 1 && (
                                                    <button type="button" onClick={() => removeListField('videos', index)} className="px-4 bg-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                                                )}
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-4">
                                            <button type="button" onClick={() => addListField('videos')} className="text-sm font-bold text-primary hover:underline">+ Add Video URL</button>
                                            <div className="h-4 w-px bg-border" />
                                            <label className="text-sm font-bold text-primary hover:underline cursor-pointer flex items-center gap-1">
                                                <Upload className="w-3 h-3" />
                                                <span>{isUploading ? 'Uploading...' : 'Upload Video Files'}</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'videos')}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- Attributes Tab --- */}
                        {activeTab === 'attributes' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Define Attributes</h3>
                                    <button type="button" onClick={addAttribute} className="text-sm px-4 py-2 bg-muted hover:bg-primary hover:text-white rounded-lg transition-colors font-bold">+ Additional Option</button>
                                </div>

                                {attributes.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2">
                                        Add attributes like "Color" or "Size" to generate variations.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {attributes.map((attr, index) => (
                                            <div key={index} className="p-4 bg-muted/30 rounded-xl border space-y-3">
                                                <div className="flex gap-2 items-start">
                                                    <div className="w-1/3">
                                                        <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Value Name</label>
                                                        <input
                                                            type="text"
                                                            value={attr.name}
                                                            onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 bg-background border rounded-lg"
                                                            placeholder="e.g. Color"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Options (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={attr.tempOptions}
                                                            onChange={(e) => updateAttribute(index, 'tempOptions', e.target.value)}
                                                            className="w-full px-3 py-2 bg-background border rounded-lg"
                                                            placeholder="e.g. Red, Blue, Green"
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => removeAttribute(index)} className="mt-6 p-2 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {attr.options.map((opt, i) => (
                                                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md border border-primary/20">{opt}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {attributes.length > 0 && (
                                    <div className="flex justify-end pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={generateVariants}
                                            disabled={attributes.some(a => !a.name || a.options.length === 0)}
                                            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            Generate / Update Variations
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- Variations Tab --- */}
                        {activeTab === 'variations' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-bold">Manage Variations ({variants.length})</h3>
                                        <button
                                            type="button"
                                            onClick={() => generateAllVariantAds(false)}
                                            disabled={isGeneratingAds || variants.length === 0}
                                            className="text-xs px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-full font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                                            title="Generate ads for all variants that have images but no ads"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            {isGeneratingAds ? 'Processing...' : 'Generate All Ads'}
                                        </button>
                                    </div>
                                    {variants.length === 0 && <span className="text-sm text-yellow-600 font-medium">Use Attributes tab to generate first.</span>}
                                </div>

                                {variants.length > 0 && (
                                    <div className="space-y-3">
                                        {variants.map((variant, index) => (
                                            <div key={index} className="p-4 bg-background border rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">

                                                {/* Image Picker for Variant */}
                                                {/* Image Picker for Variant (Click to Open Modal) */}
                                                <div
                                                    className="relative group w-20 h-20 bg-muted/50 rounded-lg overflow-hidden shrink-0 border-2 border-dashed hover:border-solid hover:border-primary cursor-pointer transition-colors"
                                                    onClick={() => setSelectingImageForVariant(index)}
                                                >
                                                    {variant.image ? (
                                                        <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                                                            <ImagePlus className="w-5 h-5" />
                                                            <span className="text-[9px] font-bold uppercase">Select</span>
                                                        </div>
                                                    )}

                                                    {/* Hover Overlay Hint */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Edit className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <h4 className="font-bold text-sm">{variant.name}</h4>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        {Object.entries(variant.attributes).map(([k, v]) => (
                                                            <span key={k}>{k}: {v}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <div className="w-24">
                                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Price</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                            className="w-full px-2 py-1 bg-muted rounded border text-sm font-bold"
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Stock</label>
                                                        <input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                                            className="w-full px-2 py-1 bg-muted rounded border text-sm font-bold"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">PO/SKU</label>
                                                        <input
                                                            type="text"
                                                            value={variant.sku || ''}
                                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                            className="w-full px-2 py-1 bg-muted rounded border text-sm font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                {/* AI Ad Creatives for Variant */}
                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                                        <Zap className="w-3 h-3 text-blue-500" /> AI Ad Sets
                                                    </label>
                                                    {variant.ad_creatives ? (
                                                        <div className="space-y-1.5 focus:outline-none">
                                                            {Array.isArray(variant.ad_creatives) ? (
                                                                variant.ad_creatives.map((set: any, sIdx: number) => (
                                                                    <div key={sIdx} className="grid grid-cols-3 gap-1 border-b border-muted pb-1 last:border-0" title={`${set.mode || 'Default'}`}>
                                                                        <img src={set.square} className="w-8 h-8 rounded object-cover border" title="Feed Var 1" />
                                                                        <img src={set.story} className="w-8 h-8 rounded object-cover border" title="Feed Var 2" />
                                                                        <img src={set.landscape} className="w-8 h-8 rounded object-cover border" title="Feed Var 3" />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="grid grid-cols-3 gap-1">
                                                                    <img src={variant.ad_creatives.square} className="w-8 h-8 rounded object-cover border" title="Feed Var 1" />
                                                                    <img src={variant.ad_creatives.story} className="w-8 h-8 rounded object-cover border" title="Feed Var 2" />
                                                                    <img src={variant.ad_creatives.landscape} className="w-8 h-8 rounded object-cover border" title="Feed Var 3" />
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => generateVariantAds(index)}
                                                                className="text-[9px] text-blue-500 font-bold hover:underline"
                                                                disabled={isGeneratingAds}
                                                            >
                                                                Regenerate All
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => generateVariantAds(index)}
                                                            disabled={isGeneratingAds || !variant.image}
                                                            className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                                                        >
                                                            <Sparkles className="w-3 h-3" /> Auto-Generate
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tech Specs Tab */}
                        {activeTab === 'specs' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Technical Specifications</h3>

                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Battery</label>
                                        <input
                                            type="text"
                                            value={formData.specs.battery}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, battery: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 24V 7Ah"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Motors</label>
                                        <input
                                            type="text"
                                            value={formData.specs.motor}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, motor: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 4x 35W"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Max Load</label>
                                        <input
                                            type="text"
                                            value={formData.specs.max_load}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, max_load: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 50 kg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Speed</label>
                                        <input
                                            type="text"
                                            value={formData.specs.speed}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, speed: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 4-6 km/h"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Charging Time</label>
                                        <input
                                            type="text"
                                            value={formData.specs.charging_time}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, charging_time: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 8-10 Hours"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Run Time</label>
                                        <input
                                            type="text"
                                            value={formData.specs.run_time}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, run_time: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 1-2 Hours"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Suitable Age</label>
                                        <input
                                            type="text"
                                            value={formData.specs.suitable_age}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, suitable_age: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 2-5 Years"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Seat Material</label>
                                        <input
                                            type="text"
                                            value={formData.specs.seat_material}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, seat_material: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. Leather / Plastic"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Seats</label>
                                        <select
                                            value={formData.specs.seats}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, seats: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                        >
                                            <option value="1">1 Seater</option>
                                            <option value="2">2 Seater</option>
                                            <option value="4">4 Seater</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Tires</label>
                                        <input
                                            type="text"
                                            value={formData.specs.tire_type}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, tire_type: e.target.value } })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. EVA Rubber"
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6 grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-4 bg-background border rounded-xl cursor-pointer hover:border-primary transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.specs.mobile_app}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, mobile_app: e.target.checked } })}
                                            className="w-5 h-5 rounded border-gray-300 text-primary"
                                        />
                                        <span className="font-semibold">Mobile App Control</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-background border rounded-xl cursor-pointer hover:border-primary transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.specs.remote_control}
                                            onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, remote_control: e.target.checked } })}
                                            className="w-5 h-5 rounded border-gray-300 text-primary"
                                        />
                                        <span className="font-semibold">2.4G Remote Control</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Logistics Tab */}
                        {activeTab === 'logistics' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Logistics & Box Content</h3>

                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Product Dimensions</label>
                                        <input
                                            type="text"
                                            value={formData.product_dimensions}
                                            onChange={(e) => setFormData({ ...formData, product_dimensions: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="L x W x H (cm)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Box Dimensions</label>
                                        <input
                                            type="text"
                                            value={formData.box_dimensions}
                                            onChange={(e) => setFormData({ ...formData, box_dimensions: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="L x W x H (cm)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Net Weight</label>
                                        <input
                                            type="text"
                                            value={formData.net_weight}
                                            onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 15 kg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Gross Weight</label>
                                        <input
                                            type="text"
                                            value={formData.gross_weight}
                                            onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none"
                                            placeholder="e.g. 18 kg"
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-8">
                                    <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Package className="w-4 h-4" /> What's in the Box?
                                    </label>
                                    <div className="space-y-3">
                                        {formData.box_content.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => updateList('box_content', index, e.target.value)}
                                                    className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                    placeholder="e.g. 1x Charger"
                                                />
                                                {formData.box_content.length > 1 && (
                                                    <button type="button" onClick={() => removeListField('box_content', index)} className="px-4 bg-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addListField('box_content')} className="text-sm font-bold text-primary hover:underline">+ Add Item</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing Tab */}
                        {activeTab === 'pricing' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Selling Price (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.base_price}
                                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none text-2xl font-bold"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">MRP (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.mrp}
                                            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none text-2xl font-bold text-muted-foreground"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Stock</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:border-primary outline-none text-2xl font-bold"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="border-t pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_new ? 'border-blue-500 bg-blue-500/10' : 'border-muted/20'}`}>
                                            <input type="checkbox" checked={formData.is_new} onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })} className="w-5 h-5 rounded text-blue-500" />
                                            <span className="font-bold">Mark as New</span>
                                        </label>
                                        <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_featured ? 'border-purple-500 bg-purple-500/10' : 'border-muted/20'}`}>
                                            <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5 rounded text-purple-500" />
                                            <span className="font-bold">Featured Product</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-8">
                                <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <h3 className="text-xl font-black flex items-center gap-2">
                                                <Sparkles className="w-6 h-6 text-blue-500" />
                                                AI Review Generator
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">Generate realistic, backdated reviews to build social proof.</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex flex-col">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Count</label>
                                                <select
                                                    value={reviewCount}
                                                    onChange={(e) => setReviewCount(Number(e.target.value))}
                                                    className="px-3 py-2 bg-background border rounded-lg font-bold"
                                                >
                                                    {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} Reviews</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Timeframe</label>
                                                <select
                                                    value={reviewDaysBack}
                                                    onChange={(e) => setReviewDaysBack(e.target.value)}
                                                    className="px-3 py-2 bg-background border rounded-lg font-bold"
                                                >
                                                    <optgroup label="Relative Time">
                                                        {[7, 30, 90, 180, 365].map(d => <option key={d} value={d.toString()}>Last {d} Days</option>)}
                                                    </optgroup>
                                                    <optgroup label="Specific Year">
                                                        <option value="2024">Year 2024</option>
                                                        <option value="2025">Year 2025</option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Style</label>
                                                <select
                                                    value={reviewStyle}
                                                    onChange={(e) => setReviewStyle(e.target.value)}
                                                    className="px-3 py-2 bg-background border rounded-lg font-bold"
                                                >
                                                    <option value="mixed">Mixed</option>
                                                    <option value="excited_parent">Excited Parent</option>
                                                    <option value="technical_buyer">Technical Buyer</option>
                                                    <option value="gift_focus">Gift Focus</option>
                                                    <option value="honest_critique">Honest & Natural</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={generateAIReviews}
                                                disabled={isGeneratingReviews}
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 mt-auto"
                                            >
                                                {isGeneratingReviews ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                                Generate Reviews
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold">Existing Reviews ({productReviews.length})</h3>
                                    </div>

                                    {productReviews.length === 0 ? (
                                        <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed">
                                            <p className="text-muted-foreground">No reviews yet for this product.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {productReviews.map((review) => (
                                                <div key={review.id} className="p-4 bg-background border rounded-2xl flex gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-lg">
                                                        {review.customer_name[0]}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold">{review.customer_name}</h4>
                                                                <div className="flex items-center gap-1 text-yellow-500">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                                                                    ))}
                                                                    <span className="text-xs text-muted-foreground ml-2">Verified Purchase</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm leading-relaxed">{review.comment}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Live Preview Card */}
                        <div className="bg-card border rounded-3xl overflow-hidden sticky top-8">
                            <div className="p-4 border-b bg-muted/30"><h3 className="font-bold">Live Preview</h3></div>
                            <div className="aspect-square bg-muted relative overflow-hidden">
                                {validImages[0] ? <img src={validImages[0]} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>}
                                {formData.is_new && <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</span>}
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg mb-1">{formData.name || 'Product Name'}</h3>
                                <div className="flex justify-between items-center">
                                    <p className="text-2xl font-black text-primary">₹{formData.base_price || '0.00'}</p>
                                    {formData.mrp && Number(formData.mrp) > Number(formData.base_price) && (
                                        <span className="text-sm text-muted-foreground line-through">₹{formData.mrp}</span>
                                    )}
                                    {variants.length > 0 && <span className="text-xs bg-muted px-2 py-1 rounded font-bold">{variants.length} Variations</span>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-primary text-white font-bold rounded-2xl hover:shadow-lg transition-all">
                                {saving ? <Loader2 className="animate-spin" /> : <Save />} Update Product
                            </button>
                            <Link href="/admin/products" className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-muted font-semibold rounded-2xl hover:bg-muted/80 transition-colors">Cancel</Link>
                        </div>
                    </div>
                </div>
            </form>

            {/* Mobile Sticky Save Button */}
            <div className="lg:hidden fixed bottom-[64px] left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-40">
                <button
                    onClick={() => document.querySelector('form')?.requestSubmit()}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                    Update Product
                </button>
            </div>

            {/* IMAGE PICKER MODAL */}
            {selectingImageForVariant !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-black">Select Image for Variation</h3>
                            <button onClick={() => setSelectingImageForVariant(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {/* Option to Clear Image */}
                                <button
                                    onClick={() => {
                                        if (selectingImageForVariant !== null) {
                                            updateVariant(selectingImageForVariant, 'image', '');
                                            setSelectingImageForVariant(null);
                                        }
                                    }}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-2 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-muted-foreground"
                                >
                                    <X className="w-8 h-8" />
                                    <span>No Image</span>
                                </button>

                                {/* Product Images */}
                                {formData.images.filter(img => img).map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (selectingImageForVariant !== null) {
                                                updateVariant(selectingImageForVariant, 'image', img);
                                                setSelectingImageForVariant(null);
                                            }
                                        }}
                                        className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Select</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
