import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, ShoppingCart, Settings, CheckCircle2 } from 'lucide-react';
import { fetchNotifications, markAllNotificationsRead } from '../services/api';
import { toast } from 'sonner';

const getIcon = (type) => {
    switch (type) {
        case 'Inventory': return <Package size={20} />;
        case 'Orders': return <ShoppingCart size={20} />;
        case 'System': return <Settings size={20} />;
        default: return <CheckCircle2 size={20} />;
    }
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('All');
    const { data: notifications, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            toast.success('All notifications marked as read');
        }
    });

    const filteredNotifications = notifications?.filter(n => activeTab === 'All' || n.type === activeTab) || [];

    const tabs = ['All', 'Inventory', 'Orders', 'System'];

    return (
        <div className="max-w-[900px] mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="headline-lg">Notifications</h1>
                    <p className="text-on-surface-variant text-sm mt-1">Manage your alerts and system updates.</p>
                </div>
                <button 
                    onClick={() => mutation.mutate()} 
                    disabled={mutation.isPending || filteredNotifications.length === 0}
                    className="btn-secondary text-sm px-4 py-2"
                >
                    Mark all as read
                </button>
            </div>

            <div className="flex gap-2 mb-6 border-b border-outline-variant/30 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            activeTab === tab 
                                ? 'bg-inverse-primary text-white' 
                                : 'bg-surface-low border border-outline-variant/50 text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-on-surface-variant p-8 text-center">Loading notifications...</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="surface-low p-8 rounded-lg border border-outline-variant text-center text-on-surface-variant">
                        No notifications found.
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`surface-base p-5 rounded-lg flex gap-4 transition-colors relative overflow-hidden ${
                                notification.is_read ? 'opacity-70 bg-background/50' : 'bg-surface-container-low border-l-2 border-l-inverse-primary'
                            }`}
                        >
                            <div className="w-10 h-10 rounded bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-semibold text-sm ${notification.is_read ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-xs text-on-surface-variant whitespace-nowrap ml-4">
                                        {formatTimeAgo(notification.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
