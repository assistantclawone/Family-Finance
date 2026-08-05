import { AppSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/dashboard/header';

export function MainLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
