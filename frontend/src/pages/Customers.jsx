import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, X, Activity, User, Mail, Search } from 'lucide-react';
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
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
      <div className="surface-elevated w-full max-w-md rounded-lg shadow-2xl scale-in-center">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/30 shrink-0">
          <h2 className="headline-md text-on-surface">Add Customer</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition"><X size={20} /></button>
        </div>
        
        <div className="p-6">
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
            <div>
                <label className="block label-md text-on-surface-variant mb-1">Full Name <span className="text-error">*</span></label>
                <div className="relative">
                    <User size={18} className="absolute left-3 top-2.5 text-on-surface-variant" />
                    <input {...register('full_name')} className="input-field pl-10" placeholder="John Doe" />
                </div>
                {errors.full_name && <span className="text-error text-xs mt-1 block">{errors.full_name.message}</span>}
            </div>
            <div>
                <label className="block label-md text-on-surface-variant mb-1">Email <span className="text-error">*</span></label>
                <div className="relative">
                    <Mail size={18} className="absolute left-3 top-2.5 text-on-surface-variant" />
                    <input type="email" {...register('email')} className="input-field pl-10" placeholder="john@example.com" />
                </div>
                {errors.email && <span className="text-error text-xs mt-1 block">{errors.email.message}</span>}
            </div>
            <div>
                <label className="block label-md text-on-surface-variant mb-1">Phone (Optional)</label>
                <input {...register('phone')} className="input-field" placeholder="+1 555 000 0000" />
            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                {isSubmitting && <Activity size={16} className="animate-spin" />}
                Create Customer
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      toast.error(err.response?.data?.detail || 'Failed to delete customer');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['customers']);
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCustomers = customers?.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
            <h1 className="headline-lg text-on-surface">Customers</h1>
            <p className="text-on-surface-variant text-sm mt-1">Manage your customer relationships.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 hidden sm:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="input-field pl-10 bg-surface-low border-outline-variant/50 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
            <Plus size={18} /> Add Customer
          </button>
        </div>
      </div>

      <div className="surface-low rounded-lg border border-outline-variant flex flex-col">
        {/* Desktop Table */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs font-medium bg-surface-container/50">
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">Loading customers...</td></tr>
            ) : filteredCustomers?.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No customers found.</td></tr>
            ) : (
              filteredCustomers?.map(customer => (
                <tr key={customer.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors">
                  <td className="px-5 py-4 font-medium flex items-center gap-3 text-on-surface">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed-dim/20 text-secondary flex items-center justify-center font-bold">
                        {customer.full_name.charAt(0)}
                    </div>
                    {customer.full_name}
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant">{customer.email}</td>
                  <td className="px-5 py-4 text-on-surface-variant">{customer.phone || '-'}</td>
                  <td className="px-5 py-4 flex justify-end gap-2">
                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-outline-variant/30">
            {isLoading ? (
              <div className="p-6 text-center text-on-surface-variant">Loading customers...</div>
            ) : filteredCustomers?.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant">No customers found.</div>
            ) : (
              filteredCustomers?.map(customer => (
                <div key={customer.id} className="p-4 hover:bg-surface-variant/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim/20 text-secondary flex items-center justify-center font-bold shrink-0">
                            {customer.full_name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-medium text-on-surface text-sm">{customer.full_name}</div>
                            <div className="text-xs text-on-surface-variant">{customer.email}</div>
                        </div>
                    </div>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"><Trash2 size={16} /></button>
                  </div>
                  {customer.phone && (
                    <div className="text-xs text-on-surface-variant mt-3 pt-3 border-t border-outline-variant/20">
                        Phone: <span className="tnum text-on-surface">{customer.phone}</span>
                    </div>
                  )}
                </div>
              ))
            )}
        </div>
      </div>

      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Customers;
