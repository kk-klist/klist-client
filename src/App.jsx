import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { store } from '@/app/store';
import { queryClient } from '@/app/queryClient';
import { router } from '@/app/router';
import { useAuthRestore } from '@/features/auth/useAuthRestore';
import { Spinner } from '@/shared/components/Spinner';

function AppContent() {
  const { isRestoring } = useAuthRestore();
  if (isRestoring) return <Spinner />;
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
