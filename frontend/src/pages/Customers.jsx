import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, X, Activity, User, Mail } from 'lucide-react';
import { fetchCustomers, createCustomer, deleteCustomer } from '../services/api';

const customerSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

const CustomerModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { full_name: '', email: '', phone: '' }
  });

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Customer created');
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
          <h2 className="text-xl font-bold">Add Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
            <div className="relative">
                <User size={18} className="absolute left-3 top-2.5 text-gray-500" />
                <input {...register('full_name')} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 outline-none transition" placeholder="John Doe" />
            </div>
            {errors.full_name && <span className="text-red-400 text-xs">{errors.full_name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
            <div className="relative">
                <Mail size={18} className="absolute left-3 top-2.5 text-gray-500" />
                <input type="email" {...register('email')} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 outline-none transition" placeholder="john@example.com" />
            </div>
            {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Phone (Optional)</label>
            <input {...register('phone')} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-blue-500 outline-none transition" placeholder="+1 555 000 0000" />
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Activity size={16} className="animate-spin" />}
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: customers, isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onMutate: async (id) => {
      await queryClient.cancelQueries(['customers']);
      const previous = queryClient.getQueryData(['customers']);
      queryClient.setQueryData(['customers'], old => old?.filter(c => c.id !== id));
      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['customers'], context.previous);
      toast.error('Failed to delete customer');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['customers']);
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate(id);
      toast.success('Customer deleted optimistically');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-emerald-500/20">
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-300">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">Loading customers...</td></tr>
            ) : customers?.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">No customers found. Add one above.</td></tr>
            ) : (
              customers?.map(customer => (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        {customer.full_name.charAt(0)}
                    </div>
                    {customer.full_name}
                  </td>
                  <td className="p-4 text-gray-300">{customer.email}</td>
                  <td className="p-4 text-gray-300">{customer.phone || '-'}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Customers;
