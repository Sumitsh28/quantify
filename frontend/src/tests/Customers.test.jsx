import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Customers from '../pages/Customers';
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api');

describe('Customers Component', () => {
  it('renders customers list', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchCustomers.mockResolvedValue([
      { id: 1, full_name: 'Alice Smith', email: 'alice@example.com', phone: '123' }
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <Customers />
      </QueryClientProvider>
    );

    expect(await screen.findAllByText('Alice Smith')).not.toHaveLength(0);
  });

  it('opens add modal', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchCustomers.mockResolvedValue([]);
    render(
      <QueryClientProvider client={queryClient}>
        <Customers />
      </QueryClientProvider>
    );

    const btns = await screen.findAllByText(/Add Customer/i);
    fireEvent.click(btns[0]);
    expect(await screen.findAllByText('Add Customer')).not.toHaveLength(0);
  });
});
