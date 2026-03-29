import { Outlet } from 'react-router-dom';
import Navbar from '../components/organisms/Navbar';
import Sidebar from '../components/organisms/Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
