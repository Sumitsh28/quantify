import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, X, Activity, ShoppingCart, Trash2 } from 'lucide-react';
import { fetchOrders, createOrder, fetchCustomers, fetchProducts, deleteOrder } from '../services/api';

const orderItemSchema = z.object({
  product_id: z.number().int().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const orderSchema = z.object({
  customer_id: z.number().int().min(1, 'Customer is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

const OrderModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { customer_id: '', items: [{ product_id: '', quantity: 1 }] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['products']); // Stock changed
      queryClient.invalidateQueries(['dashboard']); // Metrics changed
      toast.success('Order created successfully');
      onClose();
      reset();
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

  const onSubmit = (data) => {
    const payload = {
        ...data,
        customer_id: Number(data.customer_id),
        items: data.items.map(item => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) }))
    };
    const idempotencyKey = crypto.randomUUID();
    mutation.mutate({ idempotencyKey, data: payload });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
      <div className="glass w-full max-w-2xl rounded-xl p-6 shadow-2xl scale-in-center max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Customer</label>
            <select {...register('customer_id', { valueAsNumber: true })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-purple-500 outline-none transition text-white">
                <option value="">Select a customer</option>
                {customers?.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
            </select>
            {errors.customer_id && <span className="text-red-400 text-xs">{errors.customer_id.message}</span>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Order Items</label>
                <button type="button" onClick={() => append({ product_id: '', quantity: 1 })} className="text-sm text-purple-400 hover:text-purple-300 transition">+ Add Item</button>
            </div>
            
            <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="flex-1">
                            <select {...register(`items.${index}.product_id`, { valueAsNumber: true })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-purple-500 outline-none transition text-white">
                                <option value="">Select product</option>
                                {products?.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (${p.price}) - {p.quantity_in_stock} in stock</option>
                                ))}
                            </select>
                            {errors?.items?.[index]?.product_id && <span className="text-red-400 text-xs">{errors.items[index].product_id.message}</span>}
                        </div>
                        <div className="w-24">
                            <input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-purple-500 outline-none transition" />
                        </div>
                        <button type="button" onClick={() => remove(index)} className="p-2 text-gray-400 hover:text-red-400 transition mt-1"><Trash2 size={18} /></button>
                    </div>
                ))}
                {errors.items && !Array.isArray(errors.items) && <span className="text-red-400 text-xs">{errors.items.message}</span>}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Activity size={16} className="animate-spin" />}
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Orders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-purple-500/20">
          <Plus size={20} /> Create Order
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-300">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Customer ID</th>
              <th className="p-4 font-medium">Total Amount</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">Loading orders...</td></tr>
            ) : orders?.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">No orders found. Create one above.</td></tr>
            ) : (
              orders?.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-mono font-medium flex items-center gap-2">
                      <ShoppingCart size={16} className="text-purple-400"/>
                      #{order.id}
                  </td>
                  <td className="p-4 text-gray-300">Customer {order.customer_id}</td>
                  <td className="p-4 text-emerald-400 font-mono font-bold">${order.total_amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Completed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Orders;
