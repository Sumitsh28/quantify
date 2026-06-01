import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, X, Filter, Download, Laptop, ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct } from '../services/api';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be > 0'),
  quantity_in_stock: z.number().int().min(0, 'Cannot be negative'),
  threshold: z.number().int().min(0).default(10),
  supplier_name: z.string().optional(),
  supplier_part_number: z.string().optional(),
  visibility_status: z.enum(['Active', 'Draft']).default('Active'),
});

const ProductModal = ({ isOpen, onClose, product }) => {
  const queryClient = useQueryClient();
  const isEditing = !!product;
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || { 
        name: '', sku: '', category: '', description: '', 
        price: 0, quantity_in_stock: 0, threshold: 10,
        supplier_name: '', supplier_part_number: '', visibility_status: 'Active'
    }
  });

  const visibility = watch('visibility_status');

  const mutation = useMutation({
    mutationFn: isEditing ? updateProduct : createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success(isEditing ? 'Product updated' : 'Product created');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'An error occurred');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
      <div className="surface-elevated w-full max-w-5xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/30 shrink-0">
          <h2 className="headline-md">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
            <button onClick={handleSubmit((data) => mutation.mutate(isEditing ? { id: product.id, ...data } : data))} disabled={isSubmitting} className="btn-primary flex items-center gap-2 px-6">
              Save Product
            </button>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface ml-2"><X size={20}/></button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto bg-background/50 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Information */}
              <div className="surface-low p-6 rounded-lg">
                <h3 className="headline-md mb-6 text-on-surface">General Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block label-md text-on-surface-variant mb-1">Product Name <span className="text-error">*</span></label>
                    <input {...register('name')} className="input-field" placeholder="e.g. Ergonomic Office Chair" />
                    {errors.name && <span className="text-error text-xs mt-1 block">{errors.name.message}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block label-md text-on-surface-variant mb-1">SKU</label>
                        <input {...register('sku')} className="input-field" placeholder="PRD-001-A" />
                        {errors.sku && <span className="text-error text-xs mt-1 block">{errors.sku.message}</span>}
                    </div>
                    <div>
                        <label className="block label-md text-on-surface-variant mb-1">Category</label>
                        <select {...register('category')} className="input-field">
                            <option value="">Select category...</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Networking">Networking</option>
                            <option value="Peripherals">Peripherals</option>
                        </select>
                    </div>
                  </div>
                  <div>
                    <label className="block label-md text-on-surface-variant mb-1">Description</label>
                    <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Brief description of the product..."></textarea>
                  </div>
                </div>
              </div>

              {/* Inventory & Pricing */}
              <div className="surface-low p-6 rounded-lg">
                <h3 className="headline-md mb-6 text-on-surface">Inventory & Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block label-md text-on-surface-variant mb-1">Unit Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-on-surface-variant">₹</span>
                            <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="input-field pl-7" placeholder="0.00" />
                        </div>
                        {errors.price && <span className="text-error text-xs mt-1 block">{errors.price.message}</span>}
                    </div>
                    <div>
                        <label className="block label-md text-on-surface-variant mb-1">Initial Stock</label>
                        <input type="number" {...register('quantity_in_stock', { valueAsNumber: true })} className="input-field" placeholder="0" />
                        {errors.quantity_in_stock && <span className="text-error text-xs mt-1 block">{errors.quantity_in_stock.message}</span>}
                    </div>
                    <div>
                        <label className="block label-md text-on-surface-variant mb-1">Low Stock Alert</label>
                        <input type="number" {...register('threshold', { valueAsNumber: true })} className="input-field" placeholder="10" />
                    </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="surface-low p-6 rounded-lg">
                <h3 className="headline-md mb-6 text-on-surface">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block label-md text-on-surface-variant mb-1">Supplier Name</label>
                        <select {...register('supplier_name')} className="input-field">
                            <option value="">Select supplier...</option>
                            <option value="Nexus Corp">Nexus Corp</option>
                            <option value="TechSupply Inc">TechSupply Inc</option>
                        </select>
                    </div>
                    <div>
                        <label className="block label-md text-on-surface-variant mb-1">Supplier Part Number</label>
                        <input {...register('supplier_part_number')} className="input-field" placeholder="Optional" />
                    </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Visibility Status */}
              <div className="surface-low p-6 rounded-lg">
                <h3 className="headline-md mb-6 text-on-surface">Visibility Status</h3>
                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="radio" value="Active" {...register('visibility_status')} className="mt-1 w-4 h-4 text-primary bg-surface-container-highest border-outline-variant focus:ring-primary focus:ring-offset-background" />
                        <div>
                            <div className="text-sm font-medium text-on-surface">Active</div>
                            <div className="text-xs text-on-surface-variant">Product will be immediately available.</div>
                        </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="radio" value="Draft" {...register('visibility_status')} className="mt-1 w-4 h-4 text-primary bg-surface-container-highest border-outline-variant focus:ring-primary focus:ring-offset-background" />
                        <div>
                            <div className="text-sm font-medium text-on-surface">Draft</div>
                            <div className="text-xs text-on-surface-variant">Save as draft to complete later.</div>
                        </div>
                    </label>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const openCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const getStatusBadge = (qty, threshold) => {
    if (qty === 0) return <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant border border-outline-variant/50">Out of Stock</span>;
    if (qty <= (threshold || 10)) return <span className="px-3 py-1 rounded-full text-xs font-medium bg-error-container/20 text-error border border-error/30">Low Stock</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-fixed-dim/20 text-secondary border border-secondary/30">In Stock</span>;
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="headline-lg">Product Inventory</h1>
        <p className="text-on-surface-variant text-sm">Manage your catalog, stock levels, and pricing.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md relative">
        </div>
        <div className="flex items-center gap-3">
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-1.5 text-sm">
                <Plus size={16} /> New Product
            </button>
        </div>
      </div>

      <div className="surface-low rounded-lg border border-outline-variant flex flex-col">
        {/* Desktop Table */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs font-medium bg-surface-container/50">
              <th className="px-5 py-4">Product Details</th>
              <th className="px-5 py-4">SKU</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4 text-right">Stock</th>
              <th className="px-5 py-4 text-right">Price</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="p-8 text-center text-on-surface-variant">Loading products...</td></tr>
            ) : products?.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-on-surface-variant">No products found.</td></tr>
            ) : (
              products?.map(product => (
                <tr key={product.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors cursor-pointer" onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}>
                  <td className="px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant shrink-0">
                        <Laptop size={20} />
                    </div>
                    <div>
                        <div className="font-medium text-sm text-on-surface">{product.name}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{product.description || 'No description'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant text-sm">{product.sku}</td>
                  <td className="px-5 py-4 text-on-surface-variant text-sm">{product.category || '-'}</td>
                  <td className="px-5 py-4 text-right tnum font-medium text-sm">
                    <span className={product.quantity_in_stock <= (product.threshold || 10) ? 'text-error' : 'text-on-surface'}>{product.quantity_in_stock}</span>
                  </td>
                  <td className="px-5 py-4 text-right tnum font-medium text-sm text-on-surface">₹{product.price.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    {getStatusBadge(product.quantity_in_stock, product.threshold)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-outline-variant/30">
          {isLoading ? (
            <div className="p-6 text-center text-on-surface-variant">Loading products...</div>
          ) : products?.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant">No products found.</div>
          ) : (
            products?.map(product => (
              <div key={product.id} onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-4 hover:bg-surface-variant/30 transition-colors cursor-pointer active:bg-surface-variant/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant shrink-0">
                      <Laptop size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-on-surface leading-snug mb-0.5">{product.name}</div>
                      <div className="text-xs text-on-surface-variant">{product.sku} • {product.category || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="shrink-0">{getStatusBadge(product.quantity_in_stock, product.threshold)}</div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-outline-variant/20">
                  <div className="text-xs text-on-surface-variant">
                    Stock: <span className={`font-medium tnum ${product.quantity_in_stock <= (product.threshold || 10) ? 'text-error' : 'text-on-surface'}`}>{product.quantity_in_stock}</span>
                  </div>
                  <div className="text-sm font-medium tnum text-on-surface">
                    ₹{product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between text-sm text-on-surface-variant bg-surface-container/30">
            <span>Showing {products?.length ? `1-${products.length}` : '0'} of {products?.length || 0} products</span>
            <div className="flex items-center gap-4">
                <button className="flex items-center hover:text-on-surface disabled:opacity-50" disabled><ChevronLeft size={16}/> Page 1 of 1 <ChevronRight size={16}/></button>
            </div>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={editingProduct} 
      />
    </div>
  );
};

export default Products;
