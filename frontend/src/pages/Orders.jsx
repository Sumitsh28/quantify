import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import { fetchOrders } from '../services/api';

const Orders = () => {
  const { setOrderModalOpen } = useOutletContext();
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
            <h1 className="headline-lg">Orders</h1>
            <p className="text-on-surface-variant text-sm mt-1">Manage and track customer orders.</p>
        </div>
        <button onClick={() => setOrderModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Order
        </button>
      </div>

      <div className="surface-low rounded-lg border border-outline-variant flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 bg-surface-container/95 backdrop-blur-sm shadow-sm">
              <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs font-medium uppercase tracking-wider">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer ID</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Total Amount</th>
                <th className="px-5 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">Loading orders...</td></tr>
              ) : orders?.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No orders found. Create one above.</td></tr>
              ) : (
                orders?.map(order => (
                  <tr key={order.id} className="border-b border-outline-variant/20 hover:bg-white/5 transition-colors">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
