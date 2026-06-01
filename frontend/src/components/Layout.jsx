import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, Package, Users, ShoppingCart, Bell, Plus, ChevronLeft, ChevronRight, Menu, Sun, Moon } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import CreateOrderModal from './CreateOrderModal';

const SidebarItem = ({ icon: Icon, label, to, end = false, collapsed }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center ${collapsed ? 'justify-center mx-2 px-2' : 'gap-3 mx-4 px-4'} py-2.5 my-1 rounded text-sm transition-all ${
          isActive 
            ? 'bg-inverse-primary/20 text-inverse-primary font-medium' 
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
        }`
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/dashboard': return 'Dashboard';
      case '/products': return 'Product Inventory';
      case '/customers': return 'Customers';
      case '/orders': return 'Orders';
      case '/notifications': return 'Notifications';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 240 }}
        className="flex-shrink-0 border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest overflow-hidden relative"
      >
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-[-12px] top-6 bg-surface-container-highest border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-full p-0.5 z-10 hidden"
        >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-1`}>
            <div className="w-8 h-8 rounded bg-inverse-primary text-white flex items-center justify-center font-bold text-lg shrink-0 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
              Q
            </div>
            <AnimatePresence>
                {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                >
                    <h1 className="text-lg font-bold text-on-surface tracking-tight leading-tight">Quantify</h1>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Enterprise</p>
                </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="px-4 mb-6">
          <button onClick={() => setOrderModalOpen(true)} className={`btn-primary w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-center gap-2'} py-2.5`}>
            <Plus size={18} />
            {!isCollapsed && <span>New Order</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <SidebarItem icon={LayoutGrid} label="Dashboard" to="/dashboard" collapsed={isCollapsed} />
          <SidebarItem icon={Package} label="Products" to="/products" collapsed={isCollapsed} />
          <SidebarItem icon={Users} label="Customers" to="/customers" collapsed={isCollapsed} />
          <SidebarItem icon={ShoppingCart} label="Orders" to="/orders" collapsed={isCollapsed} />
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        {/* Topbar */}
        <header className="h-[64px] border-b border-outline-variant/30 flex items-center justify-between px-4 sm:px-8 bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-4 sm:gap-8 h-full">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 -ml-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-surface-variant/50">
                <Menu size={20} />
            </button>
            <div className="flex items-center h-full border-b-2 border-inverse-primary text-on-surface font-medium text-sm px-1 cursor-default">
              {getPageTitle()}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 text-on-surface-variant">
            <button aria-label="Toggle Theme" onClick={toggleTheme} className="p-2 rounded-full transition-colors hover:text-on-surface hover:bg-surface-variant/50">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <NavLink to="/notifications" className={({ isActive }) => `relative p-2 rounded-full transition-colors ${isActive ? 'text-inverse-primary bg-surface-variant/30' : 'hover:text-on-surface hover:bg-surface-variant/50'}`}>
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest"></span>
            </NavLink>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-1 sm:ml-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=494bd6" alt="User" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                <Outlet context={{ setOrderModalOpen }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <CreateOrderModal isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} />

      <Toaster theme="dark" position="top-right" richColors toastOptions={{
        className: 'bg-surface-container-high border-outline-variant text-on-surface',
      }} />
    </div>
  );
};

export default Layout;
