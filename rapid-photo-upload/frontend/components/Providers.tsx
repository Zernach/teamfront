import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { queryClient } from '../services/queryClient';
import { store } from '../store';
import { ErrorBoundary } from './ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

