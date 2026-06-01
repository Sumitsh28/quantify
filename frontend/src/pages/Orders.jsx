import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Plus, ShoppingCart, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { fetchOrders, deleteOrder } from '../services/api';

const Orders = () => {
  const { setOrderModalOpen } = useOutletContext();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  const deleteMut = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast.success('Order deleted');
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Cannot delete order')
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteMut.mutate(id);
    }
  };

  const filteredOrders = orders?.filter(o => 
    o.id.toString().includes(searchQuery) || 
    o.customer_id.toString().includes(searchQuery)
  );

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
            <h1 className="headline-lg">Orders</h1>
            <p className="text-on-surface-variant text-sm mt-1">Manage and track customer orders.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer ID..." 
              className="input-field pl-10 bg-surface-low border-outline-variant/50 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setOrderModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Order
          </button>
        </div>
      </div>

      <div className="surface-low rounded-lg border border-outline-variant flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto">
          {/* Desktop Table */}
          <table className="w-full text-left border-collapse relative hidden md:table">
            <thead className="sticky top-0 z-10 bg-surface-container/95 backdrop-blur-sm shadow-sm">
              <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs font-medium uppercase tracking-wider">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer ID</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Total Amount</th>
                <th className="px-5 py-4 text-right">Status</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-on-surface-variant">Loading orders...</td></tr>
              ) : filteredOrders?.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-on-surface-variant">No orders found. Create one above.</td></tr>
              ) : (
                filteredOrders?.map(order => (
                  <tr key={order.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors">
                    <td className="px-5 py-4 font-medium tnum text-sm text-on-surface flex items-center gap-2">
                        <ShoppingCart size={16} className="text-inverse-primary"/>
                        #{order.id}
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">Customer {order.customer_id}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right tnum font-medium text-sm text-on-surface">₹{order.total_amount.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-fixed-dim/20 text-secondary border border-secondary/30">
                        Completed
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                        <button onClick={() => handleDelete(order.id)} disabled={deleteMut.isLoading} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="block md:hidden divide-y divide-outline-variant/30">
            {isLoading ? (
              <div className="p-6 text-center text-on-surface-variant">Loading orders...</div>
            ) : filteredOrders?.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant">No orders found.</div>
            ) : (
              filteredOrders?.map(order => (
                <div key={order.id} className="p-4 hover:bg-surface-variant/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-medium tnum text-sm text-on-surface">
                      <ShoppingCart size={16} className="text-inverse-primary"/>
                      #{order.id}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary-fixed-dim/20 text-secondary border border-secondary/30">
                      Completed
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant mb-3 flex justify-between">
                    <span>Customer {order.customer_id} • {new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
                    <span className="text-xs text-on-surface-variant">Total Amount</span>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium tnum text-on-surface">₹{order.total_amount.toFixed(2)}</span>
                        <button onClick={() => handleDelete(order.id)} disabled={deleteMut.isLoading} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
