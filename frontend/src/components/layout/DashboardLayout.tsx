import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AuthGuard from '../auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
