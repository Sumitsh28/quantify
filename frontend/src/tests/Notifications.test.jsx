import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Notifications from '../pages/Notifications';
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api');

describe('Notifications Component', () => {
  it('renders notifications list', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    api.fetchNotifications.mockResolvedValue([
      { id: 1, message: 'Test Notification', type: 'info', is_read: false, created_at: new Date().toISOString() }
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );

    expect(await screen.findAllByText('Test Notification')).not.toHaveLength(0);
  });
});
