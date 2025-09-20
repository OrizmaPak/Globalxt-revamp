import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ProductsPage from './pages/Products';
import ProductCategoryPage from './pages/ProductCategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ConsultingPage from './pages/Consulting';
import IndustriesPage from './pages/Industries';
import ResourcesPage from './pages/Resources';
import ContactPage from './pages/Contact';
import PrivacyPolicyPage from './pages/PrivacyPolicy';
import TermsOfTradePage from './pages/TermsOfTrade';
import SitemapPage from './pages/SitemapPage';
import NotFoundPage from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:categorySlug" element={<ProductCategoryPage />} />
        <Route path="/products/:categorySlug/:productSlug" element={<ProductDetailPage />} />
        <Route path="/consulting" element={<ConsultingPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfTradePage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
