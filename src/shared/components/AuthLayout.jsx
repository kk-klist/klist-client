import { Outlet } from 'react-router-dom';
import { Toaster } from '@/shared/components/Toaster';

export function AuthLayout() {
  return (
    <div className="fixed inset-0 mx-auto flex max-w-[560px] flex-col bg-surface">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
