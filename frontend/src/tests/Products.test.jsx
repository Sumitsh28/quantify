import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Products from '../pages/Products';
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api');

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('Products Component', () => {
  it('renders product list', async () => {
    api.fetchProducts.mockResolvedValue([
      { id: 1, name: 'Prod A', sku: 'A1', quantity_in_stock: 100, price: 10, category: 'Cat' }
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <Products />
      </QueryClientProvider>
    );

    expect(await screen.findAllByText('Prod A')).not.toHaveLength(0);
    expect(screen.getAllByText('In Stock')).not.toHaveLength(0);
  });

  it('opens edit modal', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchProducts.mockResolvedValue([
      { id: 1, name: 'Prod A', sku: 'A1', category: 'Cat', price: 10, quantity_in_stock: 100 }
    ]);
    render(
      <QueryClientProvider client={queryClient}>
        <Products />
      </QueryClientProvider>
    );

    const productRow = await screen.findAllByText('Prod A');
    fireEvent.click(productRow[0]);
    expect(await screen.findByText('Edit Product')).toBeInTheDocument();
  });

  it('opens add modal on button click', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchProducts.mockResolvedValue([]);
    render(
      <QueryClientProvider client={queryClient}>
        <Products />
      </QueryClientProvider>
    );

    expect(await screen.findByText('New Product')).toBeInTheDocument();
  });
});
