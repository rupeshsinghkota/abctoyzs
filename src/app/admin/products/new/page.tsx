"use client";

import { useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Save, Loader2, ImagePlus, X, Zap,
    Users, Gauge, Battery, Smartphone, Tag, Star,
    Package, DollarSign, Hash
} from 'lucide-react';
import { VEHICLE_CATEGORIES, AGE_CATEGORIES } from '@/lib/data';

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState({
        slug: '',
        name: '',
        description: '',
        base_price: '',
        category: 'cars',
        subcategory: '',
        images: [''],
        voltage: '',
        age_group: '',
        stock: '0',
        is_new: false,
        is_featured: false,
        specs: {
            battery: '',
            mobile_app: false,
            max_load: '',
            speed: ''
        }
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const productData = {
                ...formData,
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                base_price: parseFloat(formData.base_price),
                stock: parseInt(formData.stock),
                images: formData.images.filter(img => img.trim())
            };

            await AdminService.createProduct(productData);
            router.push('/admin/products');
        } catch (error) {
            alert('Failed to create product. Make sure all required fields are filled.');
            setSaving(false);
        }
    }

    function updateImage(index: number, value: string) {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    }

    function addImageField() {
        setFormData({ ...formData, images: [...formData.images, ''] });
    }

    function removeImageField(index: number) {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages.length ? newImages : [''] });
    }

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Package },
        { id: 'media', label: 'Images', icon: ImagePlus },
        { id: 'specs', label: 'Specifications', icon: Gauge },
        { id: 'pricing', label: 'Pricing & Stock', icon: DollarSign },
    ];

    const validImages = formData.images.filter(img => img.trim());

    return (
        <div className="max-w-6xl mx-auto">
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
                    <p className="text-muted-foreground mt-1">Create a new product listing for your store</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 p-1.5 bg-muted rounded-2xl">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === tab.id
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
                                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
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
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            URL Slug
                                        </label>
                                        <div className="relative">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                placeholder="auto-generated"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Subcategory
                                        </label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={formData.subcategory}
                                                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                placeholder="Sports, Luxury, Off-road..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={5}
                                        className="w-full px-5 py-4 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                                        placeholder="Describe the product features, what makes it special..."
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        >
                                            {VEHICLE_CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Voltage
                                        </label>
                                        <select
                                            value={formData.voltage}
                                            onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="">Select voltage</option>
                                            <option value="12V">12V Power</option>
                                            <option value="24V">24V Power</option>
                                            <option value="36V">36V Power</option>
                                            <option value="48V">48V Power</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Age Group
                                        </label>
                                        <select
                                            value={formData.age_group}
                                            onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="">Select age</option>
                                            {AGE_CATEGORIES.map(age => (
                                                <option key={age.value} value={age.value}>{age.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Media Tab */}
                        {activeTab === 'media' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">
                                        Product Images
                                    </label>

                                    {/* Image Preview Grid */}
                                    {validImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            {validImages.map((img, index) => (
                                                <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-muted border-2 border-dashed">
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImageField(formData.images.indexOf(img))}
                                                            className="p-2 bg-red-500 text-white rounded-full"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {index === 0 && (
                                                        <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                                                            Main
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Image URL Inputs */}
                                    <div className="space-y-3">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <ImagePlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="url"
                                                        value={img}
                                                        onChange={(e) => updateImage(index, e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                </div>
                                                {formData.images.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImageField(index)}
                                                        className="px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addImageField}
                                        className="w-full mt-4 px-6 py-4 border-2 border-dashed border-muted-foreground/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary font-semibold"
                                    >
                                        <ImagePlus className="w-5 h-5" />
                                        Add Another Image URL
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Specs Tab */}
                        {activeTab === 'specs' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Battery
                                        </label>
                                        <div className="relative">
                                            <Battery className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={formData.specs.battery}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    specs: { ...formData.specs, battery: e.target.value }
                                                })}
                                                className="w-full pl-10 pr-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                placeholder="12V 7Ah"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Max Weight Capacity
                                        </label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={formData.specs.max_load}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    specs: { ...formData.specs, max_load: e.target.value }
                                                })}
                                                className="w-full pl-10 pr-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                placeholder="30kg"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Top Speed
                                        </label>
                                        <div className="relative">
                                            <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={formData.specs.speed}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    specs: { ...formData.specs, speed: e.target.value }
                                                })}
                                                className="w-full pl-10 pr-4 py-3 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                placeholder="3-5 km/h"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 p-4 bg-background border-2 rounded-xl w-full cursor-pointer hover:border-primary transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.specs.mobile_app}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    specs: { ...formData.specs, mobile_app: e.target.checked }
                                                })}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-5 h-5 text-primary" />
                                                <span className="font-semibold">Mobile App Control</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing Tab */}
                        {activeTab === 'pricing' && (
                            <div className="bg-card border rounded-3xl p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Price ($) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={formData.base_price}
                                                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-2xl font-bold"
                                                placeholder="299.99"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input
                                                type="number"
                                                required
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-background border-2 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-2xl font-bold"
                                                placeholder="50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">
                                        Product Flags
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_new ? 'border-blue-500 bg-blue-500/10' : 'border-muted-foreground/20 hover:border-blue-500/50'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_new}
                                                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <span className="font-bold block">Mark as New</span>
                                                <span className="text-sm text-muted-foreground">Show "NEW" badge on product</span>
                                            </div>
                                        </label>
                                        <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_featured ? 'border-purple-500 bg-purple-500/10' : 'border-muted-foreground/20 hover:border-purple-500/50'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_featured}
                                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Star className="w-5 h-5 text-purple-500" />
                                                <div>
                                                    <span className="font-bold block">Featured Product</span>
                                                    <span className="text-sm text-muted-foreground">Highlight on homepage</span>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Preview Card */}
                        <div className="bg-card border rounded-3xl overflow-hidden sticky top-8">
                            <div className="p-4 border-b bg-muted/30">
                                <h3 className="font-bold">Live Preview</h3>
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                                {validImages[0] ? (
                                    <img
                                        src={validImages[0]}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <ImagePlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">No image</p>
                                        </div>
                                    </div>
                                )}
                                {formData.is_new && (
                                    <span className="absolute top-3 left-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                        NEW
                                    </span>
                                )}
                                {formData.is_featured && (
                                    <span className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Featured
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    {formData.category && (
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                                            {formData.category}
                                        </span>
                                    )}
                                    {formData.voltage && (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-bold rounded-full">
                                            <Zap className="w-3 h-3" />
                                            {formData.voltage}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg mb-1">
                                    {formData.name || 'Product Name'}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {formData.subcategory || 'Subcategory'}
                                </p>
                                <p className="text-2xl font-black text-primary">
                                    ${formData.base_price || '0.00'}
                                </p>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all hover:scale-[1.02]"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Product...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Create Product
                                    </>
                                )}
                            </button>
                            <Link
                                href="/admin/products"
                                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-muted font-semibold rounded-2xl hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
