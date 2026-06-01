import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Orders from '../pages/Orders';
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api');

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ setOrderModalOpen: vi.fn() })
}));

describe('Orders Component', () => {
  it('renders orders list', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchOrders.mockResolvedValue([
      { id: 1, total_amount: 50.0, status: 'pending', created_at: new Date().toISOString(), customer_id: 1, items: [] }
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>
    );

    expect(await screen.findAllByText(/Customer 1/)).not.toHaveLength(0);
  });
});
