import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../pages/Dashboard';
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api');

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchDashboardMetrics.mockImplementation(() => new Promise(() => {})); // Never resolves
    api.fetchProducts.mockImplementation(() => new Promise(() => {}));
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders metrics and low stock alerts', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchDashboardMetrics.mockResolvedValue({
      total_products: 10,
      total_customers: 5,
      total_orders: 2,
      total_revenue: 1000
    });
    
    api.fetchProducts.mockResolvedValue([
      { id: 1, name: 'Low Stock Item', sku: 'LS-1', quantity_in_stock: 2, threshold: 5 }
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
    expect(screen.getAllByText('Low Stock Item')).not.toHaveLength(0);
  });
});
