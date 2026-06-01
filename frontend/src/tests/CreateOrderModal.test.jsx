import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateOrderModal from '../components/CreateOrderModal';
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api');

describe('CreateOrderModal Component', () => {
  it('renders modal content', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchCustomers.mockResolvedValue([
      { id: 1, full_name: 'Test Customer', email: 'test@example.com' }
    ]);
    api.fetchProducts.mockResolvedValue([
      { id: 1, name: 'Test Product', price: 10, quantity_in_stock: 100 }
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <CreateOrderModal isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Create New Order')).toBeInTheDocument();
    
    // Add product button
    const addProductBtn = screen.getByText(/Add Item/i);
    fireEvent.click(addProductBtn);
    
    // Check if select product appears
    expect(await screen.findAllByText(/Test Product/)).not.toHaveLength(0);
  });
});
