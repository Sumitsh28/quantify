import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics } from '../services/api';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass p-6 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors duration-300">
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
    <div className={`p-4 rounded-full bg-white/5 ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) return <div className="text-gray-400 animate-pulse">Loading dashboard...</div>;
  if (isError) return <div className="text-red-400">Failed to load dashboard metrics.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={data?.total_products || 0} 
          icon={Package} 
          colorClass="text-blue-400"
        />
        <StatCard 
          title="Total Customers" 
          value={data?.total_customers || 0} 
          icon={Users} 
          colorClass="text-emerald-400"
        />
        <StatCard 
          title="Total Orders" 
          value={data?.total_orders || 0} 
          icon={ShoppingCart} 
          colorClass="text-purple-400"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={data?.low_stock_count || 0} 
          icon={AlertTriangle} 
          colorClass="text-amber-400"
        />
      </div>

      <div className="mt-12 glass p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="h-48 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-lg">
          Activity chart placeholder
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
