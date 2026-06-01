import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, X, Activity } from 'lucide-react';
import { fetchProducts, createProduct, deleteProduct, updateProduct } from '../services/api';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(2, 'SKU is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  quantity_in_stock: z.number().int().min(0, 'Quantity cannot be negative'),
});

const ProductModal = ({ isOpen, onClose, product }) => {
  const queryClient = useQueryClient();
  const isEditing = !!product;
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || { name: '', sku: '', price: 0, quantity_in_stock: 0 }
  });

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
      <div className="glass w-full max-w-md rounded-xl p-6 shadow-2xl scale-in-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit((data) => mutation.mutate(isEditing ? { id: product.id, ...data } : data))} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
            <input {...register('name')} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
            {errors.name && <span className="text-red-400 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">SKU</label>
            <input {...register('sku')} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-blue-500 outline-none transition" />
            {errors.sku && <span className="text-red-400 text-xs">{errors.sku.message}</span>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-300">Price ($)</label>
              <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-blue-500 outline-none transition" />
              {errors.price && <span className="text-red-400 text-xs">{errors.price.message}</span>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-300">Stock</label>
              <input type="number" {...register('quantity_in_stock', { valueAsNumber: true })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-blue-500 outline-none transition" />
              {errors.quantity_in_stock && <span className="text-red-400 text-xs">{errors.quantity_in_stock.message}</span>}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Activity size={16} className="animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    // Optimistic UI update
    onMutate: async (id) => {
      await queryClient.cancelQueries(['products']);
      const previousProducts = queryClient.getQueryData(['products']);
      queryClient.setQueryData(['products'], old => old?.filter(p => p.id !== id));
      return { previousProducts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['products'], context.previousProducts);
      toast.error('Failed to delete product');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
      toast.success('Product deleted optimistically');
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-300">
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading products...</td></tr>
            ) : products?.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">No products found. Add one above.</td></tr>
            ) : (
              products?.map(product => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-sm text-gray-400">{product.sku}</td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 text-emerald-400 font-mono">${product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.quantity_in_stock < 10 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {product.quantity_in_stock} in stock
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
