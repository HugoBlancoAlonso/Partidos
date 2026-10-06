import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div style={{ paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
      <BottomNav />
    </div>
  );
}
