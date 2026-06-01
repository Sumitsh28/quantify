import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProducts = async () => (await api.get('/products')).data;
export const fetchProduct = async (id) => (await api.get(`/products/${id}`)).data;
export const createProduct = async (data) => (await api.post('/products', data)).data;
export const updateProduct = async ({ id, ...data }) => (await api.put(`/products/${id}`, data)).data;
export const deleteProduct = async (id) => await api.delete(`/products/${id}`);
export const fetchProductHistory = async (id) => (await api.get(`/products/${id}/history`)).data;

export const fetchCustomers = async () => (await api.get('/customers')).data;
export const createCustomer = async (data) => (await api.post('/customers', data)).data;
export const deleteCustomer = async (id) => await api.delete(`/customers/${id}`);

export const fetchOrders = async () => (await api.get('/orders')).data;
export const createOrder = async ({ idempotencyKey, data }) => 
  (await api.post('/orders', data, { headers: { 'Idempotency-Key': idempotencyKey } })).data;
export const deleteOrder = async (id) => await api.delete(`/orders/${id}`);

export const fetchNotifications = async () => (await api.get('/notifications')).data;
export const markAllNotificationsRead = async () => (await api.post('/notifications/mark-all-read')).data;

export const fetchDashboardMetrics = async () => {
    // We will need to implement this endpoint in the backend. 
    // For now, let's mock it or call it if it exists.
    try {
        return (await api.get('/dashboard')).data;
    } catch (e) {
        return { total_products: 0, total_customers: 0, total_orders: 0, low_stock_count: 0 };
    }
}

export default api;
