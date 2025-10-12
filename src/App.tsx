import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ProductsPage from './pages/Products';
import ProductCategoryPage from './pages/ProductCategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ConsultingPage from './pages/Consulting';
import IndustriesPage from './pages/Industries';
import IndustryDetailPage from './pages/IndustryDetail';
import ResourcesPage from './pages/Resources';
import ContactPage from './pages/Contact';
import PrivacyPolicyPage from './pages/PrivacyPolicy';
import TermsOfTradePage from './pages/TermsOfTrade';
import SitemapPage from './pages/SitemapPage';
import NotFoundPage from './pages/NotFound';
import BlogDetailPage from './pages/BlogDetailPage';
import FirebaseTest from './pages/FirebaseTest';
import ConsultingDetailPage from './pages/ConsultingDetail';
import ChatPage, { ChatSignInPage } from './pages/ChatPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import { ContentProvider } from './context/ContentProvider';
import { EnquiryCartProvider } from './context/EnquiryCartProvider';
import { AuthProvider } from './context/AuthProvider';
import AdminContentSync from './pages/AdminContentSync';
import EnquiryCartBadge from './components/EnquiryCartBadge';
import EnquiryCartPanel from './components/EnquiryCartPanel';
import AdminLayout from './pages/admin/AdminLayout';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import PagesAdmin from './pages/admin/PagesAdmin';
import LivePreview from './pages/admin/LivePreview';
import SplitScreenLivePreview from './pages/admin/SplitScreenLivePreview';
import { AdminEditProvider } from './context/AdminEditProvider';
import { SmartEditProvider } from './context/SmartEditProvider';
import SmartEditOverlay from './components/admin/SmartEditOverlay';
import FloatingAdminButton from './components/admin/FloatingAdminButton';
import ErrorBanner from './components/ErrorBanner';

const App = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <SmartEditProvider>
          <EnquiryCartProvider>
            <ErrorBanner />
            {/* Enquiry Cart Components */}
            <EnquiryCartBadge />
            <EnquiryCartPanel />
            
            {/* Smart Edit Components */}
            <SmartEditOverlay />
            <FloatingAdminButton />
          
          <Routes>
          {/* Chat routes - No layout to avoid navigation */}
          <Route path="/chat/:roomId" element={<ChatPage />} />
          <Route path="/chat/signin/:roomId" element={<ChatSignInPage />} />
          
          {/* Public site under main Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:categorySlug" element={<ProductCategoryPage />} />
            <Route path="/products/:categorySlug/:productSlug" element={<ProductDetailPage />} />
            <Route path="/consulting" element={<ConsultingPage />} />
            <Route path="/consulting/:slug" element={<ConsultingDetailPage />} />
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/industries/:slug" element={<IndustryDetailPage />} />
            <Route path="/resources/:slug" element={<BlogDetailPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfTradePage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/firebase-test" element={<FirebaseTest />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin area with its own layout and nested routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<CategoriesAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="pages" element={<PagesAdmin />} />
            <Route path="content-sync" element={<AdminContentSync />} />
            <Route path="chat" element={<AdminChatPage />} />
            <Route path="live-preview" element={
              <AdminEditProvider>
                <SplitScreenLivePreview />
              </AdminEditProvider>
            } />
            <Route path="live-preview-fullscreen" element={
              <AdminEditProvider>
                <LivePreview />
              </AdminEditProvider>
            } />
          </Route>
            </Routes>
          </EnquiryCartProvider>
        </SmartEditProvider>
      </ContentProvider>
    </AuthProvider>
  );
};

export default App;
