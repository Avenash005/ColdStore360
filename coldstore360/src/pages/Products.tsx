import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deactivateProduct, type Product } from '../lib/api';
import ActionDropdown from '../components/ui/ActionDropdown';

const Products = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const [sortBy, setSortBy] = useState('name_asc');

  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0;
    });

  const handleComingSoon = () => alert('Feature coming soon!');

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display text-on-surface font-semibold tracking-tight">Product Catalog</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage allowed products, categories, and storage rules</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleComingSoon} className="h-row-height-sm px-4 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export List
          </button>
          <button onClick={handleComingSoon} className="h-row-height-sm px-4 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Product
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-bright">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input 
                className="w-full h-row-height-sm pl-9 pr-4 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-outline" 
                placeholder="Search products..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="h-row-height-sm px-3 bg-surface-container-lowest border border-outline-variant text-on-surface rounded flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors" title="Filter options">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span className="font-label-md text-label-md hidden sm:inline">Filter</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-row-height-sm px-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none cursor-pointer"
            >
              <option value="name_asc">Product Name (A-Z)</option>
              <option value="category">Category</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[240px]">Product Name</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[120px]">SKU / Code</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[160px]">Category</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[120px]">Base Unit</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[120px]">Status</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[80px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-error">
                    Error loading products. Please try again.
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low transition-colors group h-row-height-md">
                    <td className="py-2 px-5 whitespace-nowrap">
                      <div className="font-medium text-on-surface">{product.name}</div>
                    </td>
                    <td className="py-2 px-5 whitespace-nowrap font-mono-sm text-outline">{product.product_code}</td>
                    <td className="py-2 px-5 whitespace-nowrap">{product.category}</td>
                    <td className="py-2 px-5 whitespace-nowrap text-on-surface-variant">{product.unit}</td>
                    <td className="py-2 px-5 whitespace-nowrap">
                      {product.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DCFCE7] text-[#166534]">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563]">Inactive</span>
                      )}
                    </td>
                    <td className="py-2 px-5 whitespace-nowrap text-center">
                      <ActionDropdown 
                        onDelete={() => deactivateMutation.mutate(product.id)} 
                        deleteLabel={product.is_active ? "Deactivate Product" : "Product Deactivated"}
                        isDestructive={product.is_active}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;
