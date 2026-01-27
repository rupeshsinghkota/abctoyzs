"use client";

import { useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Save, Loader2, ImagePlus, X, Zap,
    Users, Gauge, Battery, Smartphone, Tag, Star,
    Package, DollarSign, Hash, Layers, Split, Check
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

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

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

            // 2. Insert Product
            const newProduct = await AdminService.createProduct(productData);

            // 3. Insert Variants (if any)
            if (variants.length > 0 && newProduct?.id) {
                const variantsPayload = variants.map(v => ({
                    product_id: newProduct.id,
                    name: v.name,
                    attributes: v.attributes,
                    price: parseFloat(v.price) || 0,
                    stock: parseInt(v.stock) || 0,
                    sku: v.sku,
                    image: v.image
                }));
                await AdminService.createVariants(variantsPayload);
            }

            router.push('/admin/products');
        } catch (error) {
            console.error(error);
            alert('Failed to create product. Check console for details.');
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
        { id: 'basic', label: 'Basic Info', icon: Package },
        { id: 'media', label: 'Media', icon: ImagePlus },
        { id: 'attributes', label: 'Attributes', icon: Layers },
        { id: 'variations', label: 'Variations', icon: Split },
        { id: 'specs', label: 'Tech Specs', icon: Gauge },
        { id: 'logistics', label: 'Logistics', icon: Package },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
    ];

    const validImages = formData.images.filter(img => img.trim());

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
                    <h1 className="text-3xl font-black tracking-tight">Add New Product</h1>
                    <p className="text-muted-foreground mt-1">Create a premium product listing</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex overflow-x-auto gap-2 p-1.5 bg-muted rounded-2xl sticky top-4 z-10 backdrop-blur-md bg-opacity-90">
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

                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={8}
                                        className="w-full px-5 py-4 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono text-sm leading-relaxed"
                                        placeholder="# Amazing Features\n\n* Feature 1\n* Feature 2\n\nDescribe the product..."
                                    />
                                    <p className="text-xs text-muted-foreground mt-2 text-right">Markdown supported</p>
                                </div>
                            </div>
                        )}

                        {/* Media Tab (Images & Video) */}
                        {activeTab === 'media' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-8">
                                {/* Images Section */}
                                <div>
                                    <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <ImagePlus className="w-4 h-4" /> Product Images
                                    </label>

                                    {/* Preview Grid */}
                                    {validImages.length > 0 && (
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                            {validImages.map((img, index) => (
                                                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button type="button" onClick={() => removeListField('images', formData.images.indexOf(img))} className="p-1.5 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                                                    </div>
                                                    {index === 0 && <span className="absolute top-1 left-1 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">Main</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={img}
                                                    onChange={(e) => updateList('images', index, e.target.value)}
                                                    className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                    placeholder="https://..."
                                                />
                                                {formData.images.length > 1 && (
                                                    <button type="button" onClick={() => removeListField('images', index)} className="px-4 bg-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addListField('images')} className="text-sm font-bold text-primary hover:underline">+ Add Image URL</button>
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
                                        <button type="button" onClick={() => addListField('videos')} className="text-sm font-bold text-primary hover:underline">+ Add Video URL</button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Supports YouTube links or direct MP4 URLs. First video will be featured.</p>
                                </div>
                            </div>
                        )}

                        {/* --- NEW: Attributes Tab --- */}
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
                                            Generate Variations
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- NEW: Variations Tab --- */}
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
                                {saving ? <Loader2 className="animate-spin" /> : <Save />} Create Product
                            </button>
                            <Link href="/admin/products" className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-muted font-semibold rounded-2xl hover:bg-muted/80 transition-colors">Cancel</Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
