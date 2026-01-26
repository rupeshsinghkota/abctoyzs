"use client";

import { useState } from 'react';
import { AdminService } from '@/lib/services/admin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { VEHICLE_CATEGORIES, POWER_CATEGORIES, AGE_CATEGORIES } from '@/lib/data';

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
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
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                base_price: parseFloat(formData.base_price),
                stock: parseInt(formData.stock),
                images: formData.images.filter(img => img.trim())
            };

            await AdminService.createProduct(productData);
            router.push('/admin/products');
        } catch (error) {
            alert('Failed to create product');
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

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Add New Product</h1>
                    <p className="text-muted-foreground mt-1">Create a new product listing</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-card border rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="BMW M5 Competition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Slug (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="bmw-m5-competition (auto-generated if empty)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    placeholder="Describe the product features..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Price ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.base_price}
                                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="299.99"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Subcategory</label>
                                    <input
                                        type="text"
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Sports, Luxury, etc."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categorization */}
                    <div className="bg-card border rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Categorization</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Category *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {VEHICLE_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Voltage</label>
                                <select
                                    value={formData.voltage}
                                    onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="">Select voltage</option>
                                    <option value="12V">12V</option>
                                    <option value="24V">24V</option>
                                    <option value="36V">36V</option>
                                    <option value="48V">48V</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Age Group</label>
                                <select
                                    value={formData.age_group}
                                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="">Select age group</option>
                                    {AGE_CATEGORIES.map(age => (
                                        <option key={age.value} value={age.value}>{age.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-card border rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Product Images</h2>
                        <div className="space-y-3">
                            {formData.images.map((img, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="url"
                                        value={img}
                                        onChange={(e) => updateImage(index, e.target.value)}
                                        className="flex-1 px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {formData.images.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeImageField(index)}
                                            className="px-4 py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addImageField}
                                className="w-full px-4 py-3 border-2 border-dashed rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
                            >
                                + Add Another Image
                            </button>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-card border rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Specifications</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Battery</label>
                                <input
                                    type="text"
                                    value={formData.specs.battery}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        specs: { ...formData.specs, battery: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="12V 7Ah"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Max Load</label>
                                <input
                                    type="text"
                                    value={formData.specs.max_load}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        specs: { ...formData.specs, max_load: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="30kg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Speed</label>
                                <input
                                    type="text"
                                    value={formData.specs.speed}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        specs: { ...formData.specs, speed: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="3-5 km/h"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.specs.mobile_app}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            specs: { ...formData.specs, mobile_app: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-semibold">Mobile App Support</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="bg-card border rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Product Flags</h2>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_new}
                                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-semibold">Mark as New</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-semibold">Mark as Featured</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
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
                            className="px-8 py-4 bg-muted font-bold rounded-xl hover:bg-muted/80 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
