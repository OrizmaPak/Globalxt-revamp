import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderTopBar from './HeaderTopBar';
import Navbar from './Navbar';
import Footer from './Footer';
import { useContent } from '../context/ContentProvider';
import LogoLoader from './LogoLoader';
import SEO from './SEO';
import { canonicalForPath } from '../utils/seo';

const Layout = () => {
  const { pathname } = useLocation();
  const { loading } = useContent();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also ensure the document body scrolls to top
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  if (loading) {
    return <LogoLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white relative">
      <SEO
        title="Global XT Limited | Agro Commodities & Export Consulting"
        description="Global XT Limited exports premium African agro commodities and provides export consulting, training, and brokerage services."
        pathname={pathname}
        canonical={canonicalForPath(pathname)}
        type="website"
      />
      <div className="hidden lg:block">
        <HeaderTopBar />
      </div>
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
