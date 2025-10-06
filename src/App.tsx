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
import { ContentProvider } from './context/ContentProvider';
import { EnquiryCartProvider } from './context/EnquiryCartProvider';
import AdminContentSync from './pages/AdminContentSync';
import EnquiryCartBadge from './components/EnquiryCartBadge';
import EnquiryCartPanel from './components/EnquiryCartPanel';

const App = () => {
  return (
    <ContentProvider>
      <EnquiryCartProvider>
        {/* Enquiry Cart Components */}
        <EnquiryCartBadge />
        <EnquiryCartPanel />
        
        <Routes>
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
          <Route path="/admin/content-sync" element={<AdminContentSync />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        </Routes>
      </EnquiryCartProvider>
    </ContentProvider>
  );
};

export default App;
