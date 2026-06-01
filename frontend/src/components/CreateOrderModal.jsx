import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, X, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder, fetchCustomers, fetchProducts } from '../services/api';

const orderItemSchema = z.object({
  product_id: z.number().int().min(1, 'Required'),
  quantity: z.number().int().min(1, 'Min 1'),
});

const orderSchema = z.object({
  customer_id: z.number().int().min(1, 'Required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

const CreateOrderModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers, enabled: isOpen });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts, enabled: isOpen });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['products']); 
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Order created successfully');
      onClose();
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error('Concurrency conflict! Someone else bought this product. Please retry.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Insufficient stock');
      } else {
        toast.error('Failed to create order');
      }
    }
  });

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { customer_id: '', items: [{ product_id: '', quantity: 1 }] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items');

  const { subtotal, totalItems } = useMemo(() => {
    let sub = 0;
    let count = 0;
    watchItems.forEach(item => {
      if (item.product_id && item.quantity > 0) {
        const prod = products?.find(p => p.id === Number(item.product_id));
        if (prod) {
          sub += prod.price * item.quantity;
          count += Number(item.quantity);
        }
      }
    });
    return { subtotal: sub, totalItems: count };
  }, [watchItems, products]);

  const shipping = 45.00;
  const taxRate = 0.085;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  const onSubmit = (data) => {
    const payload = {
        customer_id: Number(data.customer_id),
        items: data.items.map(item => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
        shipping,
        tax
    };
    const idempotencyKey = crypto.randomUUID();
    mutation.mutate({ idempotencyKey, data: payload });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="surface-elevated relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl border border-outline-variant/30"
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 shrink-0">
                <div>
                    <h2 className="headline-lg text-on-surface">Create New Order</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Fill in the details below to process a new customer order.</p>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-on-surface-variant hover:text-on-surface">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-background/50">
                <form id="globalOrderForm" onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Form */}
                    <div className="flex-1 space-y-6">
                        {/* Customer Information */}
                        <div className="surface-low p-6 rounded-lg border border-outline-variant">
                            <h3 className="headline-md mb-6 text-on-surface">Customer Information</h3>
                            <div>
                                <label className="block label-md text-on-surface-variant mb-2">Select Customer</label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-2.5 text-on-surface-variant" />
                                    <select {...register('customer_id', { valueAsNumber: true })} className="input-field pl-10 appearance-none bg-background">
                                        <option value="">Search by name, email, or company...</option>
                                        {customers?.map(c => (
                                            <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.customer_id && <span className="text-error text-xs mt-1 block">{errors.customer_id.message}</span>}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="surface-low p-6 rounded-lg border border-outline-variant">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="headline-md text-on-surface">Order Items</h3>
                                <button type="button" onClick={() => append({ product_id: '', quantity: 1 })} className="text-sm font-medium text-on-surface hover:text-primary transition-colors flex items-center gap-1">
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {fields.map((field, index) => {
                                    const selectedProdId = watchItems[index]?.product_id;
                                    const prod = products?.find(p => p.id === Number(selectedProdId));
                                    const isLowStock = prod && prod.quantity_in_stock <= (prod.threshold || 10);
                                    
                                    return (
                                    <div key={field.id} className="surface-base p-4 rounded-lg flex items-start gap-4">
                                        <div className="flex-1">
                                            <label className="block label-md text-on-surface-variant mb-2">Product</label>
                                            <select {...register(`items.${index}.product_id`, { valueAsNumber: true })} className="input-field bg-background">
                                                <option value="">Select product...</option>
                                                {products?.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                                                ))}
                                            </select>
                                            {errors?.items?.[index]?.product_id && <span className="text-error text-xs mt-1 block">{errors.items[index].product_id.message}</span>}
                                        </div>
                                        <div className="w-32">
                                            <label className="block label-md text-on-surface-variant mb-2">Quantity</label>
                                            <input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="input-field bg-background" />
                                        </div>
                                        <div className="mt-8 flex items-center gap-4">
                                            {prod && (
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${isLowStock ? 'bg-error-container/20 text-error border-error/30' : 'bg-surface-variant text-on-surface-variant border-outline-variant'}`}>
                                                    {isLowStock ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            )}
                                            <button type="button" onClick={() => remove(index)} className="p-2 text-on-surface-variant hover:text-error transition-colors bg-surface-container rounded border border-outline-variant/50"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                )})}
                                {errors.items && !Array.isArray(errors.items) && <span className="text-error text-xs block mt-2">{errors.items.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-[380px]">
                        <div className="surface-low p-6 rounded-lg border border-outline-variant sticky top-0">
                            <h3 className="headline-md mb-6 text-on-surface">Order Summary</h3>
                            
                            <div className="space-y-4 text-sm text-on-surface-variant border-b border-outline-variant/30 pb-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="text-on-surface font-medium tnum">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Shipping</span>
                                    <span className="text-on-surface font-medium tnum">₹{shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Tax (8.5%)</span>
                                    <span className="text-on-surface font-medium tnum">₹{tax.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mb-6">
                                <span className="headline-md text-on-surface">Total</span>
                                <span className="headline-lg text-on-surface tnum">₹{total.toFixed(2)}</span>
                            </div>
                            
                            <button type="submit" disabled={isSubmitting || watchItems.length === 0} className="btn-primary w-full py-3 text-[15px]">
                                {isSubmitting ? 'Processing...' : 'Submit Order'}
                            </button>
                            <p className="text-xs text-on-surface-variant text-center mt-4">Please review all details before submitting.</p>
                        </div>
                    </div>
                </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateOrderModal;
