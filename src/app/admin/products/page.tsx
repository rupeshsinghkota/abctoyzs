"use client";

import { useEffect, useState } from 'react';
import { AdminService, Product } from '@/lib/services/admin';
import Link from 'next/link';
import {
    Plus, Loader2, Search, Edit, Trash2, Package,
    Eye, Star, Zap, LayoutGrid, List, Filter,
    TrendingUp, Box, DollarSign, MoreVertical
} from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await AdminService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        try {
            await AdminService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            setDeleteId(null);
        } catch (error) {
            alert('Failed to delete product');
        }
    }

    const categories = ['all', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Stats
    const totalValue = products.reduce((sum, p) => sum + p.base_price * p.stock, 0);
    const lowStock = products.filter(p => p.stock < 10).length;
    const featuredCount = products.filter(p => p.is_featured).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground animate-pulse">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">
                        {products.length} items in inventory
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    Add New Product
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Box className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">Total Products</span>
                    </div>
                    <p className="text-3xl font-black">{products.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-xl">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">Inventory Value</span>
                    </div>
                    <p className="text-3xl font-black">${totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-500/20 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">Low Stock</span>
                    </div>
                    <p className="text-3xl font-black">{lowStock}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Star className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">Featured</span>
                    </div>
                    <p className="text-3xl font-black">{featuredCount}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card/50 backdrop-blur-sm border rounded-2xl p-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2.5 bg-background border rounded-xl text-sm font-medium outline-none"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-muted rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-24 bg-gradient-to-b from-muted/30 to-transparent rounded-3xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        {searchQuery || categoryFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first product to the inventory'}
                    </p>
                    {!searchQuery && categoryFilter === 'all' && (
                        <Link
                            href="/admin/products/new"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            Add First Product
                        </Link>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* Card Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="group bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Image */}
                            <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                                {product.images[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-16 h-16 text-muted-foreground/30" />
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {product.is_new && (
                                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                                            NEW
                                        </span>
                                    )}
                                    {product.is_featured && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                            <Star className="w-3 h-3" /> Featured
                                        </span>
                                    )}
                                </div>

                                {/* Stock Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${product.stock > 10 ? 'bg-green-500/90 text-white' :
                                            product.stock > 0 ? 'bg-yellow-500/90 text-black' :
                                                'bg-red-500/90 text-white'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </span>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        className="p-3 bg-white rounded-full hover:scale-110 transition-transform"
                                    >
                                        <Edit className="w-5 h-5 text-primary" />
                                    </Link>
                                    <Link
                                        href={`/product/${product.slug}`}
                                        target="_blank"
                                        className="p-3 bg-white rounded-full hover:scale-110 transition-transform"
                                    >
                                        <Eye className="w-5 h-5 text-blue-500" />
                                    </Link>
                                    <button
                                        onClick={() => setDeleteId(product.id)}
                                        className="p-3 bg-white rounded-full hover:scale-110 transition-transform"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                                        {product.category}
                                    </span>
                                    {product.voltage && (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-full">
                                            <Zap className="w-3 h-3" />
                                            {product.voltage}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                                    {product.subcategory || 'Ride-on Toy'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-black text-primary">
                                        ${product.base_price.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-sm">{product.rating || '0.0'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-card border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Product</th>
                                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Category</th>
                                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Price</th>
                                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Stock</th>
                                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Status</th>
                                    <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 border">
                                                    {product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-muted-foreground/50" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">{product.subcategory || 'Ride-on Toy'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-lg font-bold">${product.base_price.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    product.stock > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {product.is_new && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-full">
                                                        New
                                                    </span>
                                                )}
                                                {product.is_featured && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-bold rounded-full">
                                                        Featured
                                                    </span>
                                                )}
                                                {!product.is_new && !product.is_featured && (
                                                    <span className="text-muted-foreground text-sm">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/product/${product.slug}`}
                                                    target="_blank"
                                                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(product.id)}
                                                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-2">Delete Product?</h3>
                        <p className="text-center text-muted-foreground mb-8">
                            This action cannot be undone. The product will be permanently removed from your inventory.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-6 py-3 bg-muted font-bold rounded-xl hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
