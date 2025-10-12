import { NavLink, Outlet } from 'react-router-dom';
import { AdminNotificationProvider } from '../../context/AdminNotificationProvider';
import { useAuth } from '../../context/AuthProvider';
import { allowedAdminEmails } from '../../config/admin';

const AdminLayout = () => {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const email = user?.email?.toLowerCase();
  const isAllowed = !!email && allowedAdminEmails.includes(email);

  return (
    <AdminNotificationProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-brand-primary text-white font-bold">A</span>
              <div>
                <div className="text-sm font-semibold text-brand-deep">Global XT Admin</div>
                <div className="text-xs text-slate-500">Manage content, products, categories</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="text-xs text-slate-600">{user.email}</div>
              )}
              {user ? (
                <button onClick={signOutUser} className="px-3 py-1.5 text-xs rounded border border-slate-300 hover:bg-slate-100">Sign out</button>
              ) : (
                <button onClick={signInWithGoogle} className="px-3 py-1.5 text-xs rounded bg-brand-primary text-white hover:bg-brand-lime">Sign in with Google</button>
              )}
            </div>
          </div>
          {user && isAllowed && (
            <div className="mx-auto max-w-6xl px-4 pb-3">
              <nav className="flex gap-4 text-sm">
                <NavLink to="/admin/categories" className={({ isActive }) => `px-3 py-1.5 rounded ${isActive ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}>Categories</NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => `px-3 py-1.5 rounded ${isActive ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}>Products</NavLink>
                <NavLink to="/admin/pages" className={({ isActive }) => `px-3 py-1.5 rounded ${isActive ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}>Pages</NavLink>
                <div className="relative group">
                  <NavLink to="/admin/live-preview" className={({ isActive }) => `px-3 py-1.5 rounded ${isActive ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}>Live Preview ▾</NavLink>
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <NavLink to="/admin/live-preview" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Split Screen</NavLink>
                    <NavLink to="/admin/live-preview-fullscreen" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Full Screen</NavLink>
                  </div>
                </div>
                <NavLink to="/admin/content-sync" className={({ isActive }) => `px-3 py-1.5 rounded ${isActive ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}>Content Sync</NavLink>
                <NavLink to="/admin/chat" className={({ isActive }) => `px-3 py-1.5 rounded flex items-center space-x-1 ${isActive ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chat</span>
                </NavLink>
              </nav>
            </div>
          )}
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          {loading ? (
            <div className="p-6 text-sm text-slate-600">Checking access...</div>
          ) : !user ? (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <h2 className="text-lg font-semibold text-brand-deep">Admin sign-in required</h2>
              <p className="text-sm text-slate-600 mt-2">Please sign in with your Google account to continue.</p>
              <button onClick={signInWithGoogle} className="mt-4 px-4 py-2 rounded bg-brand-primary text-white hover:bg-brand-lime">Sign in with Google</button>
            </div>
          ) : !isAllowed ? (
            <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <h2 className="text-lg font-semibold text-rose-700">Access denied</h2>
              <p className="text-sm text-rose-700 mt-2">You don't have access to the admin area.</p>
              <p className="text-xs text-rose-700/80 mt-1">Signed in as: {user.email}</p>
              <button onClick={signOutUser} className="mt-4 px-4 py-2 rounded border border-rose-300 text-rose-700 hover:bg-rose-100">Sign out</button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </AdminNotificationProvider>
  );
};

export default AdminLayout;
