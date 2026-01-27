"use client";

import { useState, useEffect, use } from 'react';
import { AdminService } from '@/lib/services/admin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Save, Loader2, ImagePlus, X, Zap,
    Users, Gauge, Battery, Smartphone, Tag, Star,
    Package, DollarSign, Hash, Layers, Split, Check,
    Upload, Sparkles
} from 'lucide-react';
import { VEHICLE_CATEGORIES, AGE_CATEGORIES } from '@/lib/data';

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
    const [brandingIndex, setBrandingIndex] = useState<number | null>(null);
    const [isBrandingAll, setIsBrandingAll] = useState(false);
    const [isGeneratingPosters, setIsGeneratingPosters] = useState(false);
    const [generatedPosters, setGeneratedPosters] = useState<string[]>([]);

    // Variations State
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    const [formData, setFormData] = useState({
        slug: '',
        name: '',
        description: '',
        base_price: '',
        category: 'cars',
        subcategory: '',
        images: [''],
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
        specs: {
            battery: '',
            motor: '',
            seats: '1',
            tire_type: '',
            mobile_app: false,
            remote_control: false,
            max_load: '',
            speed: '',
            features: [] as string[]
        }
    });

    // Load Data
    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        try {
            const data: any = await AdminService.getProductWithVariants(id);

            // Map product data to form state
            setFormData({
                slug: data.slug || '',
                name: data.name || '',
                description: data.description || '',
                base_price: data.base_price?.toString() || '',
                category: data.category || 'cars',
                subcategory: data.subcategory || '',
                images: data.images?.length ? data.images : [''],
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
                specs: {
                    battery: data.specs?.battery || '',
                    motor: data.specs?.motor || '',
                    seats: data.specs?.seats?.toString() || '1',
                    tire_type: data.specs?.tire_type || '',
                    mobile_app: data.specs?.mobile_app || false,
                    remote_control: data.specs?.remote_control || false,
                    max_load: data.specs?.max_load || '',
                    speed: data.specs?.speed || '',
                    features: data.specs?.features || []
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
                    image: v.image || ''
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

    const generateAIDescription = async () => {
        if (!formData.name) {
            alert('Please enter a product name first');
            return;
        }

        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: formData.name,
                    category: formData.category,
                    type: 'description',
                    notes: formData.prompt_notes
                })
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);
            setFormData({ ...formData, description: data });
        } catch (error: any) {
            console.error(error);
            alert('AI Generation failed: ' + error.message);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const generateAISpecs = async () => {
        if (!formData.name) {
            alert('Please enter a product name first');
            return;
        }

        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: formData.name,
                    category: formData.category,
                    type: 'specs',
                    notes: formData.prompt_notes
                })
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);

            setFormData({
                ...formData,
                specs: {
                    ...formData.specs,
                    battery: data.Battery || formData.specs.battery,
                    motor: data.Motors || formData.specs.motor,
                    speed: data.Speed || formData.specs.speed,
                    max_load: data.MaxLoad || formData.specs.max_load
                }
            });
        } catch (error: any) {
            console.error(error);
            alert('AI Generation failed: ' + error.message);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const generateAILogistics = async () => {
        if (!formData.name) {
            alert('Please enter a product name first');
            return;
        }

        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: formData.name,
                    category: formData.category,
                    type: 'logistics',
                    notes: formData.prompt_notes
                })
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);

            setFormData({
                ...formData,
                product_dimensions: data.dimensions || formData.product_dimensions,
                gross_weight: data.weight || formData.gross_weight,
                box_content: data.whats_in_the_box && data.whats_in_the_box.length > 0 ? data.whats_in_the_box : formData.box_content
            });
        } catch (error: any) {
            console.error(error);
            alert('AI Generation failed: ' + error.message);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const generateFullProduct = async () => {
        if (!formData.prompt_notes) {
            alert('Please enter some product details or notes first');
            return;
        }

        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'all',
                    notes: formData.prompt_notes
                })
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);

            // Populate everything
            setFormData(prev => {
                let finalDesc = data.description || prev.description;
                if (generatedPosters.length > 0) {
                    finalDesc = integratePostersIntoDescription(finalDesc, generatedPosters);
                }

                return {
                    ...prev,
                    name: data.name || prev.name,
                    description: finalDesc,
                    meta_title: data.meta_title || prev.meta_title,
                    meta_description: data.meta_description || prev.meta_description,
                    product_dimensions: data.logistics?.product_dimensions || prev.product_dimensions,
                    gross_weight: data.logistics?.gross_weight || prev.gross_weight,
                    box_content: data.logistics?.whats_in_the_box || prev.box_content,
                    specs: {
                        ...prev.specs,
                        battery: data.specs?.battery || prev.specs.battery,
                        motor: data.specs?.motor || prev.specs.motor,
                        speed: data.specs?.speed || prev.specs.speed,
                        max_load: data.specs?.max_load || prev.specs.max_load,
                        tire_type: data.specs?.tire_type || prev.specs.tire_type,
                        seats: data.specs?.seats?.toString() || prev.specs.seats,
                        mobile_app: data.specs?.mobile_app ?? prev.specs.mobile_app,
                        remote_control: data.specs?.remote_control ?? prev.specs.remote_control,
                    }
                };
            });

            alert('✨ Product details updated successfully!');
        } catch (error: any) {
            console.error(error);
            alert('AI Generation failed: ' + error.message);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const brandImage = async (index: number) => {
        const imageUrl = formData.images[index];
        if (!imageUrl) return;

        setBrandingIndex(index);
        try {
            const res = await fetch('/api/admin/ai/image/brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl, productName: formData.name })
            });
            const { newImageUrl, error } = await res.json();
            if (error) throw new Error(error);

            setFormData(prev => {
                const freshImages = [...prev.images];
                freshImages[index] = newImageUrl;
                return { ...prev, images: freshImages };
            });
            return newImageUrl;
        } catch (error: any) {
            console.error(error);
            alert('Branding failed: ' + error.message);
            return null;
        } finally {
            setBrandingIndex(null);
        }
    };

    const brandAllImages = async () => {
        const imagesToBrand = formData.images.filter(img => img.trim() !== '');
        if (imagesToBrand.length === 0) return;

        setIsBrandingAll(true);
        try {
            // Process ALL in parallel for a true "at once" experience
            const brandingPromises = formData.images.map((img, i) => {
                if (img.trim()) {
                    return brandImage(i);
                }
                return Promise.resolve(null);
            });

            await Promise.all(brandingPromises);
            alert('✨ All images branded and enhanced successfully!');
        } catch (error: any) {
            console.error(error);
            alert('Bulk branding failed');
        } finally {
            setIsBrandingAll(false);
        }
    };
    // Helper to insert images into description HTML
    const integratePostersIntoDescription = (description: string, urls: string[]) => {
        if (!urls.length) return description;
        let d = description;

        // Remove any existing poster blocks to avoid duplicates
        d = d.replace(/<div class="my-10 marketing-poster">[\s\S]*?<\/div>/g, '');

        // Insert first poster after hook (p)
        const firstPIdx = d.indexOf('</p>');
        if (firstPIdx !== -1) {
            const imgHtml = `\n<div class="my-10 marketing-poster"><img src="${urls[0]}" alt="Premium Performance" class="rounded-3xl w-full shadow-2xl border-4 border-white/10" /></div>\n`;
            d = d.slice(0, firstPIdx + 4) + imgHtml + d.slice(firstPIdx + 4);
        }

        // Insert second poster before Safety section
        const safetyIdx = d.indexOf('🛡️ Safety');
        if (safetyIdx !== -1) {
            const h3Idx = d.lastIndexOf('<h3', safetyIdx);
            if (h3Idx !== -1) {
                const imgHtml = `\n<div class="my-10 marketing-poster"><img src="${urls[1]}" alt="Luxury Experience" class="rounded-3xl w-full shadow-2xl border-4 border-white/10" /></div>\n`;
                d = d.slice(0, h3Idx) + imgHtml + d.slice(h3Idx);
            }
        }
        return d;
    };

    const generatePosters = async () => {
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
            // Define two key marketing angles
            const angles = [
                { type: 'Performance & Speed', text: 'Unmatched 4WD Performance and Speed' },
                { type: 'Luxury & Comfort', text: 'Premium Interior and Realistic Design' }
            ];

            const posterUrls: string[] = [];

            for (const angle of angles) {
                const res = await fetch('/api/admin/ai/image/poster', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productName: effectiveName,
                        featureText: angle.text,
                        productNotes: formData.prompt_notes,
                        originalImageUrl: formData.images[0] // Use main image as reference
                    })
                });
                const { posterUrl, error } = await res.json();
                if (error) throw new Error(error);
                posterUrls.push(posterUrl);
            }

            setGeneratedPosters(posterUrls);

            setFormData(prev => ({
                ...prev,
                description: integratePostersIntoDescription(prev.description, posterUrls)
            }));

            alert('✨ Marketing Posters generated and integrated into description!');
        } catch (error: any) {
            console.error(error);
            alert('Poster generation failed: ' + error.message);
        } finally {
            setIsGeneratingPosters(false);
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
                    image: formData.images[0] || ''
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
            // 1. Prepare Main Product Data
            const productData = {
                ...formData,
                // Do NOT auto-update slug on edit to preserve SEO, unless explicitly changed by user? 
                // For now, keep existing slug if not empty.
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                base_price: parseFloat(formData.base_price) || 0,
                stock: parseInt(formData.stock) || 0,
                images: formData.images.filter(img => img.trim()),
                videos: formData.videos.filter(v => v.trim()),
                box_content: formData.box_content.filter(i => i.trim()),
                specs: {
                    ...formData.specs,
                    seats: parseInt(formData.specs.seats) || 1
                },
                // Save definitions
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
                    image: v.image
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

    const tabs = [
        { id: 'media', label: 'Media', icon: ImagePlus },
        { id: 'basic', label: 'Basic Info', icon: Package },
        { id: 'attributes', label: 'Attributes', icon: Layers },
        { id: 'variations', label: 'Variations', icon: Split },
        { id: 'specs', label: 'Tech Specs', icon: Gauge },
        { id: 'logistics', label: 'Logistics', icon: Package },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
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

                                <div className="grid grid-cols-2 gap-4">
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
                                            <button
                                                type="button"
                                                onClick={generateAIDescription}
                                                disabled={isGeneratingAI || !formData.name}
                                                className="text-[10px] sm:text-xs px-3 py-1.5 bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white rounded-lg transition-all font-bold flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                {isGeneratingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                                            </button>
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
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <ImagePlus className="w-4 h-4" /> Product Images
                                        </label>
                                        {formData.images.some(img => img.trim()) && (
                                            <button
                                                type="button"
                                                onClick={brandAllImages}
                                                disabled={isBrandingAll || isUploading}
                                                className="text-[10px] sm:text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg transition-all font-bold flex items-center gap-1.5 hover:bg-purple-700 shadow-sm disabled:opacity-50"
                                            >
                                                {isBrandingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                {isBrandingAll ? 'Branding All...' : '✨ Brand All with AI'}
                                            </button>
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
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => brandImage(index)}
                                                                disabled={brandingIndex === index}
                                                                className="p-2 bg-purple-600 text-white rounded-full hover:scale-110 transition-transform disabled:opacity-50"
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
                                                                className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
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

                                <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border-2 border-purple-100 dark:border-purple-500/20 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4" /> AI Automation Center
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={generatePosters}
                                                disabled={isGeneratingPosters || !formData.images[0] || !formData.prompt_notes}
                                                className="text-[10px] sm:text-xs px-4 py-2 bg-blue-600 text-white rounded-xl transition-all font-bold flex items-center gap-1.5 hover:bg-blue-700 shadow-lg disabled:opacity-50"
                                            >
                                                {isGeneratingPosters ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                                                {isGeneratingPosters ? 'Creating Posters...' : '🎬 Create Premium Posters'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={generateFullProduct}
                                                disabled={isGeneratingAI || !formData.prompt_notes}
                                                className="text-[10px] sm:text-xs px-4 py-2 bg-purple-600 text-white rounded-xl transition-all font-bold flex items-center gap-1.5 hover:bg-purple-700 shadow-lg disabled:opacity-50"
                                            >
                                                {isGeneratingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                {isGeneratingAI ? 'Generating All...' : '✨ Magic Generate All Details'}
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={formData.prompt_notes}
                                        onChange={(e) => setFormData({ ...formData, prompt_notes: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border rounded-xl text-sm focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                                        placeholder="Paste supplier details, manufacturer notes, or raw product text here for the AI to analyze..."
                                        rows={4}
                                    />
                                    <div className="flex items-center gap-2 text-[10px] text-purple-400 font-medium">
                                        <Zap className="w-3 h-3" />
                                        <span>Pro Tip: Add images first, then paste details here and click "Create Posters" followed by "Magic Generate"!</span>
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
                                    <h3 className="text-lg font-bold">Manage Variations ({variants.length})</h3>
                                    {variants.length === 0 && <span className="text-sm text-yellow-600 font-medium">Use Attributes tab to generate first.</span>}
                                </div>

                                {variants.length > 0 && (
                                    <div className="space-y-3">
                                        {variants.map((variant, index) => (
                                            <div key={index} className="p-4 bg-background border rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">

                                                {/* Image Picker for Variant */}
                                                <div className="relative group w-20 h-20 bg-muted/50 rounded-lg overflow-hidden shrink-0 border-2 border-dashed hover:border-solid hover:border-primary cursor-pointer">
                                                    {variant.image ? (
                                                        <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImagePlus className="w-6 h-6" /></div>
                                                    )}

                                                    {/* Mini Image Picker overlay on hover */}
                                                    <div className="absolute inset-0 bg-white dark:bg-black bg-opacity-95 opacity-0 group-hover:opacity-100 transition-opacity p-1 overflow-y-auto grid grid-cols-2 gap-1 z-10">
                                                        {validImages.map((img, i) => (
                                                            <button
                                                                type="button"
                                                                key={i}
                                                                onClick={() => updateVariant(index, 'image', img)}
                                                                className="aspect-square bg-muted rounded overflow-hidden"
                                                            >
                                                                <img src={img} className="w-full h-full object-cover" />
                                                            </button>
                                                        ))}
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
                                    <button
                                        type="button"
                                        onClick={generateAISpecs}
                                        disabled={isGeneratingAI || !formData.name}
                                        className="text-xs px-4 py-2 bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white rounded-xl transition-all font-bold flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {isGeneratingAI ? 'Suggesting...' : '⚡ Suggest Specs'}
                                    </button>
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
                                            placeholder="e.g. 5-8 km/h"
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
                                    <button
                                        type="button"
                                        onClick={generateAILogistics}
                                        disabled={isGeneratingAI || !formData.name}
                                        className="text-xs px-4 py-2 bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white rounded-xl transition-all font-bold flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {isGeneratingAI ? 'Suggesting...' : '✨ Suggest Logistics'}
                                    </button>
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
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Price ($)</label>
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
                                    <p className="text-2xl font-black text-primary">${formData.base_price || '0.00'}</p>
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
        </div>
    );
}
