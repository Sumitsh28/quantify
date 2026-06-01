import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics, fetchProducts } from '../services/api';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, trend, isCurrency = false }) => (
  <div className="surface-low p-6 rounded-lg flex flex-col justify-between hover:bg-surface-variant/30 transition-colors">
    <p className="text-on-surface-variant text-xs font-semibold tracking-wider mb-2 uppercase">{title}</p>
    <h3 className="display-lg mb-4">{isCurrency ? `₹${value.toLocaleString()}` : value.toLocaleString()}</h3>
    <div className="flex items-center gap-1.5 text-secondary text-sm font-medium">
      <TrendingUp size={16} />
      <span>+{trend}% from last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const lowStockProducts = products?.filter(p => p.quantity_in_stock <= (p.threshold || 10)).slice(0, 5) || [];

  if (isLoading) return <div className="text-on-surface-variant animate-pulse p-8">Loading Command Center...</div>;
  if (isError) return <div className="text-error p-8">Failed to load metrics.</div>;

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <h1 className="headline-lg">Command Center</h1>
        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
          <RefreshCw size={14} />
          <span>Last updated: Just now</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Products" 
          value={data?.total_products || 0} 
          trend={5.2}
        />
        <StatCard 
          title="Total Customers" 
          value={data?.total_customers || 0} 
          trend={12.4}
        />
        <StatCard 
          title="Total Orders" 
          value={data?.total_orders || 0} 
          trend={3.1}
        />
        <StatCard 
          title="Revenue" 
          value={data?.total_revenue || 142000} 
          trend={8.7}
          isCurrency
        />
      </div>

      <div className="surface-low rounded-lg overflow-hidden border border-outline-variant">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant/50">
          <div className="flex items-center gap-2 text-error">
             <AlertTriangle size={18} />
             <h2 className="headline-md text-on-surface">Low Stock Alerts</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
            View All Inventory
          </Link>
        </div>
        
        {/* Desktop Table */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs uppercase tracking-wider font-semibold bg-surface-container/50">
              <th className="px-5 py-3">Product Name</th>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3 text-right">Current Stock</th>
              <th className="px-5 py-3 text-right">Threshold</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No low stock items.</td></tr>
            ) : (
              lowStockProducts.map(product => {
                const isCritical = product.quantity_in_stock <= (product.threshold || 10) / 2;
                return (
                <tr key={product.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-on-surface">{product.name}</td>
                  <td className="px-5 py-4 text-on-surface-variant text-sm">{product.sku}</td>
                  <td className={`px-5 py-4 text-right font-bold tnum ${isCritical ? 'text-error' : 'text-tertiary'}`}>
                    {product.quantity_in_stock}
                  </td>
                  <td className="px-5 py-4 text-right text-on-surface-variant tnum">{product.threshold || 10}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      isCritical 
                        ? 'bg-error-container/20 text-error border-error/30' 
                        : 'bg-tertiary-container/20 text-tertiary border-tertiary/30'
                    }`}>
                      {isCritical ? 'CRITICAL' : 'WARNING'}
                    </span>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-outline-variant/30">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant">No low stock items.</div>
            ) : (
              lowStockProducts.map(product => {
                const isCritical = product.quantity_in_stock <= (product.threshold || 10) / 2;
                return (
                  <div key={product.id} className="p-4 hover:bg-surface-variant/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-on-surface leading-snug mb-0.5">{product.name}</div>
                        <div className="text-xs text-on-surface-variant">{product.sku}</div>
                      </div>
                      <span className={`inline-flex shrink-0 items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        isCritical 
                          ? 'bg-error-container/20 text-error border-error/30' 
                          : 'bg-tertiary-container/20 text-tertiary border-tertiary/30'
                      }`}>
                        {isCritical ? 'CRITICAL' : 'WARNING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-outline-variant/20">
                      <div className="text-xs text-on-surface-variant">
                        Threshold: <span className="tnum">{product.threshold || 10}</span>
                      </div>
                      <div className="text-sm font-medium">
                        Current Stock: <span className={`tnum font-bold ${isCritical ? 'text-error' : 'text-tertiary'}`}>{product.quantity_in_stock}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
